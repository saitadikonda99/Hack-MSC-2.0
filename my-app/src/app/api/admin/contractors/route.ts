import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

// GET /api/admin/contractors - Get all contractors
export async function GET(req: NextRequest) {
  try {
    // Authenticate and verify super admin
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Verify user is super admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized. Super admin access required.' }, { status: 403 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const isAvailable = searchParams.get('isAvailable');

    // Build filter
    const where: any = {};
    if (status) where.status = status;
    if (isAvailable !== null && isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true';
    }

    // Get all contractors with optional filters
    const contractors = await prisma.contractor.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Get statistics
    const stats = {
      total: await prisma.contractor.count(),
      active: await prisma.contractor.count({ where: { status: 'active' } }),
      available: await prisma.contractor.count({ where: { isAvailable: true } }),
      suspended: await prisma.contractor.count({ where: { status: 'suspended' } }),
    };

    return NextResponse.json({
      contractors,
      stats,
      message: 'Contractors retrieved successfully'
    });

  } catch (error: any) {
    console.error('Get contractors error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/contractors - Create new contractor
export async function POST(req: NextRequest) {
  try {
    // Authenticate and verify super admin
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Verify user is super admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized. Super admin access required.' }, { status: 403 });
    }

    const { name, email, phone, latitude, longitude, status, isAvailable } = await req.json();

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if contractor with email already exists
    const existingContractor = await prisma.contractor.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingContractor) {
      return NextResponse.json(
        { error: 'Contractor with this email already exists' },
        { status: 409 }
      );
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash default password
    const defaultPassword = '123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Use transaction to ensure both user and contractor are created atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create user account for contractor
      const contractorUser = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: 'contractor',
          isActive: true,
        }
      });

      // Create contractor linked to user
      const contractor = await tx.contractor.create({
        data: {
          name,
          email: email.toLowerCase(),
          phone,
          userId: contractorUser.id,
          latitude: latitude && latitude !== '' ? parseFloat(latitude) : null,
          longitude: longitude && longitude !== '' ? parseFloat(longitude) : null,
          status: status || 'active',
          isAvailable: isAvailable !== undefined ? isAvailable : true,
        }
      });

      return contractor;
    });

    return NextResponse.json({
      contractor: result,
      message: 'Contractor created successfully with default password: 123456'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create contractor error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/contractors - Update contractor
export async function PUT(req: NextRequest) {
  try {
    // Authenticate and verify super admin
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Verify user is super admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized. Super admin access required.' }, { status: 403 });
    }

    const { id, name, email, phone, latitude, longitude, status, isAvailable, rating } = await req.json();

    // Validation
    if (!id) {
      return NextResponse.json(
        { error: 'Contractor ID is required' },
        { status: 400 }
      );
    }

    // Check if contractor exists
    const existingContractor = await prisma.contractor.findUnique({
      where: { id }
    });

    if (!existingContractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      );
    }

    // If email is being changed, check for duplicates
    if (email && email.toLowerCase() !== existingContractor.email) {
      const emailExists = await prisma.contractor.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Contractor with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Update contractor
    const updatedContractor = await prisma.contractor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        ...(phone && { phone }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        ...(status && { status }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(rating !== undefined && { rating }),
      }
    });

    return NextResponse.json({
      contractor: updatedContractor,
      message: 'Contractor updated successfully'
    });

  } catch (error: any) {
    console.error('Update contractor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/contractors - Delete contractor
export async function DELETE(req: NextRequest) {
  try {
    // Authenticate and verify super admin
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Verify user is super admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized. Super admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Contractor ID is required' },
        { status: 400 }
      );
    }

    // Check if contractor exists
    const contractor = await prisma.contractor.findUnique({
      where: { id: parseInt(id) }
    });

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      );
    }

    // Delete contractor
    await prisma.contractor.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      message: 'Contractor deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete contractor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
