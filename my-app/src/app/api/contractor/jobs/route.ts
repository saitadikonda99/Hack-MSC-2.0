import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

// GET /api/contractor/jobs - Get jobs within 50km of contractor's location
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

    // Get contractor profile with location
    const contractor = await prisma.contractor.findUnique({
      where: { userId: user.id }
    });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor profile not found' }, { status: 404 });
    }

    if (!contractor.latitude || !contractor.longitude) {
      return NextResponse.json({ 
        error: 'Location not set. Please update your location in profile.',
        jobs: [],
        contractorLocation: null
      });
    }

    // Get filter parameter
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    // Build where clause based on filter
    let whereClause: any = {};
    
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        whereClause.status = 'pending';
      } else if (statusFilter === 'in_progress') {
        whereClause.status = 'in_progress';
        whereClause.assignedTo = user.email;
      } else if (statusFilter === 'resolved') {
        whereClause.status = 'resolved';
        whereClause.assignedTo = user.email;
      }
    }

    // Get all reports (we'll filter by distance in JavaScript)
    const allReports = await prisma.report.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter reports within 50km and calculate distances
    const jobsWithDistance = allReports
      .map(report => {
        const distance = calculateDistance(
          contractor.latitude!,
          contractor.longitude!,
          report.lat,
          report.lng
        );

        return {
          id: report.id,
          lat: report.lat,
          lng: report.lng,
          imageUrl: report.imageUrl,
          issueType: report.issueType,
          severity: report.severity,
          description: report.description,
          status: report.status,
          assignedTo: report.assignedTo,
          createdAt: report.createdAt.toISOString(),
          distance: distance,
          userId: report.userId,
          userName: report.user.name
        };
      })
      .filter(job => job.distance <= 50) // Only jobs within 50km
      .sort((a, b) => a.distance - b.distance); // Sort by distance

    return NextResponse.json({
      jobs: jobsWithDistance,
      contractorLocation: {
        latitude: contractor.latitude,
        longitude: contractor.longitude
      },
      message: `Found ${jobsWithDistance.length} jobs within 50km`
    });

  } catch (error: any) {
    console.error('Get contractor jobs error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
