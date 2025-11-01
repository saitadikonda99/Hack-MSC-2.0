#!/usr/bin/env node
/**
 * Test script to demonstrate the complete ML workflow
 * This simulates exactly what happens when a user uploads an image
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function simulateImageUpload() {
  console.log('🚧 CivicIndia ML Workflow Simulation');
  console.log('=' * 50);
  
  // Step 1: Simulate image upload (use existing test image)
  const testImage = 'public/uploads/1720298482136-light.webp';
  const issueTypeFromUser = 'streetlight';
  const lat = '12.9716';
  const lng = '77.5946';
  
  console.log('📸 Step 1: User uploaded image');
  console.log(`   Image: ${testImage}`);
  console.log(`   Issue Type: ${issueTypeFromUser}`);
  console.log(`   Location: ${lat}, ${lng}`);
  
  // Step 2: Call ML Model (exactly like the API does)
  console.log('\n🤖 Step 2: Calling ML Model...');
  
  const mlScript = path.join(process.cwd(), 'ml-model', 'detect.py');
  const imagePath = path.join(process.cwd(), testImage);
  
  try {
    const command = `python ${mlScript} ${imagePath} ${issueTypeFromUser}`;
    console.log(`   Command: ${command}`);
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.log(`   ML Logs: ${stderr}`);
    }
    
    const result = JSON.parse(stdout);
    console.log('\n✅ Step 3: ML Analysis Complete!');
    console.log('   ML Result:', JSON.stringify(result, null, 2));
    
    // Step 3: Calculate Points (like the API does)
    const calculatePoints = (issueType, severity) => {
      let basePoints = 10;
      
      const typeMultiplier = {
        'pothole': 1.0,
        'streetlight': 1.3,
        'water_leak': 1.5,
        'garbage': 0.8,
        'traffic_signal': 1.4,
        'road_damage': 1.2,
        'other': 0.9
      };
      
      const severityBonus = Math.floor(severity * 2.5);
      const aiBonus = severity > 7 ? 3 : (severity > 6 ? 2 : 1);
      const multiplier = typeMultiplier[issueType] || 1.0;
      
      return Math.floor(basePoints * multiplier) + severityBonus + aiBonus;
    };
    
    const pointsAwarded = calculatePoints(result.issueType, result.severity);
    
    console.log('\n💰 Step 4: Points Calculation');
    console.log(`   Issue Type: ${result.issueType}`);
    console.log(`   Severity: ${result.severity}/10`);
    console.log(`   Confidence: ${result.confidence || 'N/A'}`);
    console.log(`   Points Awarded: ${pointsAwarded}`);
    
    // Step 4: Simulate Database Save
    console.log('\n📊 Step 5: Save to Database (Simulated)');
    console.log('   ✅ Report saved');
    console.log('   ✅ Points awarded to user');
    console.log('   ✅ User total points updated');
    
    console.log('\n🎉 Complete Workflow Summary:');
    console.log(`   User uploaded: ${issueTypeFromUser} issue`);
    console.log(`   AI detected: ${result.issueType} (severity: ${result.severity})`);
    console.log(`   Points earned: ${pointsAwarded} civic points`);
    console.log(`   Status: SUCCESS! 🚀`);
    
  } catch (error) {
    console.error('\n❌ ML Analysis Failed:', error.message);
    console.log('\n🔄 Fallback: Using user input');
    console.log(`   Issue Type: ${issueTypeFromUser}`);
    console.log(`   Severity: 7.5 (default)`);
    console.log(`   Points: 25 (estimated)`);
  }
}

// Run the simulation
simulateImageUpload().catch(console.error);