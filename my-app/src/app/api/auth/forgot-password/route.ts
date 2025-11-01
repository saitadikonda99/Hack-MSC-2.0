import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      message: 'If an account with that email exists, we\'ve sent a password reset link.'
    });

    if (!user) {
      return successResponse;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // In a real application, you would:
    // 1. Store the reset token in the database (you'd need to add fields to User model)
    // 2. Send an email with the reset link
    // 3. The reset link would be something like: /auth/reset-password/${resetToken}

    // For now, we'll just log the token (in production, send via email)
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`);

    // TODO: Store token in database and send email
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     resetToken,
    //     resetTokenExpiry
    //   }
    // });

    return successResponse;

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}