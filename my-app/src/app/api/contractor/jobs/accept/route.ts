import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// POST /api/contractor/jobs/accept - Accept a job
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

    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Check if job exists and is available
    const job = await prisma.report.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'pending') {
      return NextResponse.json({ error: 'Job is not available' }, { status: 400 });
    }

    if (job.assignedTo) {
      return NextResponse.json({ error: 'Job is already assigned' }, { status: 400 });
    }

    // Accept the job
    const updatedJob = await prisma.report.update({
      where: { id: jobId },
      data: {
        status: 'in_progress',
        assignedTo: user.email
      }
    });

    return NextResponse.json({
      job: updatedJob,
      message: 'Job accepted successfully'
    });

  } catch (error: any) {
    console.error('Accept job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
