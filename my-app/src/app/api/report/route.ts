// app/api/report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { writeFile } from 'fs/promises';
import path from 'path';

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
    const description = formData.get('description') as string;

    if (!file || !lat || !lng) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
    await writeFile(filepath, buffer);

    // Map frontend issue types to backend expected types
    const issueTypeMapping: { [key: string]: string } = {
      'pothole': 'pothole',
      'streetlight': 'streetlight',
      'garbage': 'garbage',
      'drainage': 'water_leak',
      'traffic': 'traffic_signal',
      'road': 'road_damage',
      'other': 'other'
    };
    
    const mappedIssueType = issueTypeMapping[issueTypeFromForm || 'pothole'] || 'pothole';

    let issueType = mappedIssueType;
    let severity = 7.5;
    let avgTimeToFix = 0;
    let aiDescription = '';

    // Google Gemini API Analysis
    const analyzeWithGemini = async () => {
      try {
        const imageBase64 = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';
        
        const geminiApiKey = 'AIzaSyAshUEdnkxAzo6zla1FB2QeLcZErRstxWw';
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
        
        const prompt = `Analyze this civic infrastructure image and identify any issues. 
Respond with a JSON object only in this exact format:
{
  "issueType": "pothole|streetlight|garbage|water_leak|traffic_signal|road_damage|other|unknown",
  "severity": <number 1-10 where 1=no issue, 10=critical>,
  "confidence": <number 0-1>,
  "description": "<brief description>",
  "avgTimeToFix": <number of days to fix the issue, 0 if no issue detected>
}

IMPORTANT RULES:
- If severity is 1-2 (no significant issue), issueType MUST be "unknown"
- Only assign a specific issueType (pothole, streetlight, etc.) if severity is 3 or higher
- avgTimeToFix should be 0 if no issue is detected (severity 1-2)

Issue types:
- pothole: road potholes, cracks, or damage
- streetlight: broken or non-functional street lights
- garbage: litter, waste, or garbage accumulation
- water_leak: water leaks, drainage issues, flooding
- traffic_signal: broken traffic lights or signs
- road_damage: road maintenance needed
- other: other civic issues
- unknown: no clear issue detected (use when severity is 1-2)

Severity scale:
- 1-2: No significant issue or very minor - MUST use "unknown" as issueType
- 3-4: Minor issue
- 5-6: Moderate issue
- 7-8: Significant issue requiring attention
- 9-10: Critical/serious issue requiring urgent action

Average time to fix (days) guidelines:
- Minor issues (severity 3-4): 1-3 days
- Moderate issues (severity 5-6): 3-7 days
- Significant issues (severity 7-8): 7-14 days
- Critical issues (severity 9-10): 1-5 days (urgent)
- No issue (severity 1-2): 0 days

Only return the JSON object, no other text.`;

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64
                  }
                }
              ]
            }]
          })
        });

        console.log('Gemini API response:', response);

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Extract JSON from response (handle markdown code blocks if present)
        let jsonText = responseText.trim();
        if (jsonText.includes('```')) {
          const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
          if (jsonMatch) jsonText = jsonMatch[1];
        }
        
        let result = JSON.parse(jsonText);
        
        // Fix issue type if severity is 1-2 (no issue) - should be "unknown"
        if (result.severity <= 2 && result.issueType !== 'unknown') {
          result.issueType = 'unknown';
          result.avgTimeToFix = 0;
        }
        
        // Ensure avgTimeToFix exists
        if (typeof result.avgTimeToFix === 'undefined' || result.avgTimeToFix === null) {
          result.avgTimeToFix = result.severity <= 2 ? 0 : Math.max(1, Math.min(30, result.severity * 2));
        }
        
        console.log('Gemini Analysis Result:', result);
        
        return result;
      } catch (err: any) {
        console.warn('Gemini API analysis failed:', err.message);
        return null;
      }
    };

    // Run Gemini analysis
    try {
      const geminiAnalysis = await analyzeWithGemini();
      
      if (geminiAnalysis && geminiAnalysis.issueType) {
        // Use Gemini result if it detected an issue
        if (geminiAnalysis.issueType !== 'unknown') {
          issueType = geminiAnalysis.issueType;
          severity = Math.min(10, Math.max(1, geminiAnalysis.severity || 7.5));
          avgTimeToFix = geminiAnalysis.avgTimeToFix || 0;
          aiDescription = geminiAnalysis.description || '';
          
          console.log('Using Gemini analysis:', {
            issueType: geminiAnalysis.issueType,
            severity: geminiAnalysis.severity,
            confidence: geminiAnalysis.confidence,
            description: geminiAnalysis.description,
            avgTimeToFix: geminiAnalysis.avgTimeToFix
          });
        } else {
          // Gemini found no issue - use low severity
          issueType = mappedIssueType;
          severity = Math.min(3, geminiAnalysis.severity || 2);
          avgTimeToFix = 0;
          aiDescription = geminiAnalysis.description || '';
        }
      } else {
        // Gemini analysis failed, use form input with default severity
        issueType = mappedIssueType;
        severity = 7.5;
        avgTimeToFix = 0;
        console.warn('Gemini analysis returned no result, using form input');
      }
    } catch (err: any) {
      console.error('Gemini analysis failed:', err.message);
      // Fallback to form input
      issueType = mappedIssueType;
      severity = 7.5;
      avgTimeToFix = 0;
    }
    
    // Ensure avgTimeToFix is always a valid number
    avgTimeToFix = Math.max(0, Math.round(avgTimeToFix || 0));

    // Calculate points based on severity and issue type
    const calculatePoints = (issueType: string, severity: number) => {
      let basePoints = 10; // Base points for any report
      
      // Enhanced bonus points based on issue type priority and impact
      const typeMultiplier: { [key: string]: number } = {
        'pothole': 1.0,           // Standard road safety issue
        'streetlight': 1.3,       // Safety critical at night
        'water_leak': 1.5,        // High priority infrastructure 
        'garbage': 0.8,           // Important but lower priority
        'traffic_signal': 1.4,    // Critical for traffic safety
        'road_damage': 1.2,       // Infrastructure maintenance
        'other': 0.9              // General issues
      };
      
      // Enhanced severity bonus calculation
      const severityBonus = Math.floor(severity * 2.5); // Increased reward for high severity
      
      // AI confidence bonus (reward accurate AI detections)
      const aiBonus = severity > 7 ? 3 : (severity > 6 ? 2 : 1);
      
      const multiplier = typeMultiplier[issueType] || 1.0;
      return Math.floor(basePoints * multiplier) + severityBonus + aiBonus;
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
          description: description || aiDescription || null,
          avgTimeToFix,
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
      avgTimeToFix,
      message: `Report submitted successfully! You earned ${pointsAwarded} civic points!`
    });
  } catch (err: any) {
    console.error('Error submitting report:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
  });
  console.log('Fetched reports:', reports);
  return NextResponse.json(reports);
}