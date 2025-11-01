// app/api/report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { writeFile } from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

    // Get user to verify they exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('photo') as File;
    const lat = formData.get('lat') as string;
    const lng = formData.get('lng') as string;
    const issueTypeFromForm = formData.get('issueType') as string;

    if (!file || !lat || !lng) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
    await writeFile(filepath, buffer);

    // Run Python ML Model (via CLI)
    const mlScript = path.join(process.cwd(), 'ml-model', 'detect.py');
    const imagePath = path.join(process.cwd(), 'public', 'uploads', filename);

    let issueType = issueTypeFromForm || 'pothole';
    let severity = 7.5;

    try {
      const { stdout } = await execAsync(`python ${mlScript} ${imagePath}`);
      const result = JSON.parse(stdout);
      // Use ML detection if available, otherwise use form input
      if (result.issueType && result.issueType !== 'unknown') {
        issueType = result.issueType;
      }
      severity = result.severity;
    } catch (err) {
      console.warn('ML failed, using form input or default');
    }

    // Calculate points based on severity and issue type
    const calculatePoints = (issueType: string, severity: number) => {
      let basePoints = 10; // Base points for any report
      
      // Bonus points based on issue type
      const typeMultiplier: { [key: string]: number } = {
        'pothole': 1.0,
        'streetlight': 1.2,
        'water_leak': 1.5,
        'garbage': 0.8,
        'traffic_signal': 1.3,
        'road_damage': 1.4
      };
      
      // Bonus points for higher severity (more critical issues)
      const severityBonus = Math.floor(severity * 2);
      
      const multiplier = typeMultiplier[issueType] || 1.0;
      return Math.floor(basePoints * multiplier) + severityBonus;
    };

    const pointsAwarded = calculatePoints(issueType, severity);

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the report
      const report = await tx.report.create({
        data: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          imageUrl: `/uploads/${filename}`,
          issueType,
          severity,
          userId: user.id,
          pointsAwarded,
        },
      });

      // Award points to the user
      await tx.point.create({
        data: {
          userId: user.id,
          type: 'earned',
          amount: pointsAwarded,
          description: `Report submitted: ${issueType}`,
          reportId: report.id,
        },
      });

      // Update user's point totals
      await tx.user.update({
        where: { id: user.id },
        data: {
          totalPoints: { increment: pointsAwarded },
          availablePoints: { increment: pointsAwarded },
        },
      });

      return report;
    });

    return NextResponse.json({ 
      success: true, 
      report: result, 
      pointsAwarded,
      message: `Report submitted successfully! You earned ${pointsAwarded} civic points!`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(reports);
}