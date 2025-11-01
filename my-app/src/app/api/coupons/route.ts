import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// Available coupon options
const COUPON_OPTIONS = [
  { brand: 'swiggy', name: 'Swiggy', pointsCost: 100, value: 50, emoji: '🍔' },
  { brand: 'zomato', name: 'Zomato', pointsCost: 100, value: 50, emoji: '🍕' },
  { brand: 'flipkart', name: 'Flipkart', pointsCost: 200, value: 100, emoji: '🛍️' },
  { brand: 'amazon', name: 'Amazon', pointsCost: 200, value: 100, emoji: '📦' },
  { brand: 'swiggy', name: 'Swiggy Premium', pointsCost: 250, value: 150, emoji: '🍔' },
  { brand: 'zomato', name: 'Zomato Premium', pointsCost: 250, value: 150, emoji: '🍕' },
  { brand: 'flipkart', name: 'Flipkart Premium', pointsCost: 500, value: 250, emoji: '🛍️' },
  { brand: 'amazon', name: 'Amazon Premium', pointsCost: 500, value: 250, emoji: '📦' },
];

// Generate random coupon code
function generateCouponCode(brand: string): string {
  const prefix = brand.substring(0, 3).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase().substring(-4);
  return `${prefix}${randomPart}${timestamp}`;
}

// GET /api/coupons - Get user's coupons and available options
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Get user's coupons
    const userCoupons = await prisma.coupon.findMany({
      where: { userId: decoded.userId },
      orderBy: { redeemedAt: 'desc' },
    });

    // Calculate available points
    const allPoints = await prisma.point.findMany({
      where: { userId: decoded.userId },
      select: { amount: true },
    });

    let totalPointsEarned = 0;
    let totalPointsRedeemed = 0;

    allPoints.forEach(point => {
      if (point.amount > 0) {
        totalPointsEarned += point.amount;
      } else {
        totalPointsRedeemed += Math.abs(point.amount);
      }
    });

    const availablePoints = totalPointsEarned - totalPointsRedeemed;

    return NextResponse.json({
      coupons: userCoupons,
      availableOptions: COUPON_OPTIONS,
      availablePoints: availablePoints,
    });

  } catch (error: any) {
    console.error('Coupons GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/coupons - Redeem points for a coupon
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { brand, pointsCost, value } = await req.json();

    // Validate the coupon option exists
    const couponOption = COUPON_OPTIONS.find(
      opt => opt.brand === brand && opt.pointsCost === pointsCost && opt.value === value
    );

    if (!couponOption) {
      return NextResponse.json({ error: 'Invalid coupon option' }, { status: 400 });
    }

    // Calculate current available points
    const allPoints = await prisma.point.findMany({
      where: { userId: decoded.userId },
      select: { amount: true },
    });

    let totalPointsEarned = 0;
    let totalPointsRedeemed = 0;

    allPoints.forEach(point => {
      if (point.amount > 0) {
        totalPointsEarned += point.amount;
      } else {
        totalPointsRedeemed += Math.abs(point.amount);
      }
    });

    const availablePoints = totalPointsEarned - totalPointsRedeemed;

    // Check if user has enough points
    if (availablePoints < pointsCost) {
      return NextResponse.json(
        { 
          error: 'Insufficient points', 
          available: availablePoints,
          required: pointsCost
        }, 
        { status: 400 }
      );
    }

    // Generate unique coupon code
    let couponCode = generateCouponCode(brand);
    
    // Ensure uniqueness
    let existingCoupon = await prisma.coupon.findUnique({
      where: { couponCode }
    });
    
    while (existingCoupon) {
      couponCode = generateCouponCode(brand);
      existingCoupon = await prisma.coupon.findUnique({
        where: { couponCode }
      });
    }

    // Create coupon and deduct points in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the coupon
      const coupon = await tx.coupon.create({
        data: {
          userId: decoded.userId,
          brand: brand,
          couponCode: couponCode,
          value: value,
          pointsCost: pointsCost,
          status: 'active',
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        },
      });

      // Deduct points
      await tx.point.create({
        data: {
          userId: decoded.userId,
          type: 'redeemed',
          amount: -pointsCost,
          description: `Redeemed ${couponOption.name} coupon worth ₹${value}`,
        },
      });

      return coupon;
    });

    const newBalance = availablePoints - pointsCost;

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed ${pointsCost} points for ${couponOption.name} coupon!`,
      coupon: result,
      newBalance: newBalance,
    });

  } catch (error: any) {
    console.error('Coupon POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/coupons - Mark coupon as used
export async function PATCH(req: NextRequest) {
  try {
    // Authenticate user
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { couponId } = await req.json();

    // Find and update the coupon
    const coupon = await prisma.coupon.findFirst({
      where: {
        id: couponId,
        userId: decoded.userId,
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    if (coupon.status === 'used') {
      return NextResponse.json({ error: 'Coupon already used' }, { status: 400 });
    }

    // Update coupon status
    const updatedCoupon = await prisma.coupon.update({
      where: { id: couponId },
      data: {
        status: 'used',
        usedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Coupon marked as used',
      coupon: updatedCoupon,
    });

  } catch (error: any) {
    console.error('Coupon PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
