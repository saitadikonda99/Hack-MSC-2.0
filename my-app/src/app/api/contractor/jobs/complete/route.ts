import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// POST /api/contractor/jobs/complete - Mark a job as completed
export async function POST(req: NextRequest) {
  try {
    // Authenticate
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Verify user is contractor
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.role !== 'contractor') {
      return NextResponse.json({ error: 'Unauthorized. Contractor access required.' }, { status: 403 });
    }

    // Get contractor profile
    const contractor = await prisma.contractor.findUnique({
      where: { userId: user.id }
    });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor profile not found' }, { status: 404 });
    }

    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Check if job exists
    const job = await prisma.report.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Verify job is assigned to this contractor
    if (job.assignedTo !== user.email) {
      return NextResponse.json({ error: 'You are not assigned to this job' }, { status: 403 });
    }

    if (job.status === 'resolved') {
      return NextResponse.json({ error: 'Job is already completed' }, { status: 400 });
    }

    // Use transaction to update job and contractor stats
    const result = await prisma.$transaction(async (tx) => {
      // Mark job as resolved
      const updatedJob = await tx.report.update({
        where: { id: jobId },
        data: {
          status: 'resolved'
        }
      });

      // Update contractor stats
      await tx.contractor.update({
        where: { id: contractor.id },
        data: {
          completedJobs: { increment: 1 },
          totalJobs: { increment: 1 }
        }
      });

      return updatedJob;
    });

    return NextResponse.json({
      job: result,
      message: 'Job marked as completed successfully'
    });

  } catch (error: any) {
    console.error('Complete job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
