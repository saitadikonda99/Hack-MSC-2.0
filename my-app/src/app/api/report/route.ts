// app/api/report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
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

    // Save to DB
    const report = await prisma.report.create({
      data: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        imageUrl: `/uploads/${filename}`,
        issueType,
        severity,
      },
    });

    return NextResponse.json({ success: true, report });
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