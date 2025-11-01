import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// GET /api/contractor/profile - Get contractor's own profile
export async function GET(req: NextRequest) {
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

    return NextResponse.json({
      contractor,
      message: 'Profile retrieved successfully'
    });

  } catch (error: any) {
    console.error('Get contractor profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
