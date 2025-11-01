#!/usr/bin/env python3
"""
Quick test of the enhanced pothole detection system
"""

import subprocess
import json
import os

def test_detection():
    """Test pothole detection on sample images"""
    test_images = [
        "/Users/tadikondasaimanikanta/Dev/Hack-MSC-2.0/data/pathholes_Dataset/images/potholes44.png",
        "/Users/tadikondasaimanikanta/Dev/Hack-MSC-2.0/data/pathholes_Dataset/images/potholes50.png",
        "/Users/tadikondasaimanikanta/Dev/Hack-MSC-2.0/ml-model/test_pothole.jpg"
    ]
    
    print("🚧 Testing Enhanced Pothole Detection System\n")
    
    for i, img_path in enumerate(test_images, 1):
        if os.path.exists(img_path):
            print(f"Test {i}: {os.path.basename(img_path)}")
            try:
                # Run detection script
                result = subprocess.run([
                    './venv/bin/python', 'detect.py', img_path
                ], capture_output=True, text=True, cwd='/Users/tadikondasaimanikanta/Dev/Hack-MSC-2.0/ml-model')
                
                if result.returncode == 0:
                    result_dict = json.loads(result.stdout.strip())
                    
                    print(f"  ✅ Issue Type: {result_dict['issueType']}")
                    print(f"  ✅ Severity: {result_dict['severity']}/10")
                    if 'confidence' in result_dict:
                        print(f"  ✅ Confidence: {result_dict['confidence']:.2f}")
                    print()
                else:
                    print(f"  ❌ Error: {result.stderr}")
                    print()
            except Exception as e:
                print(f"  ❌ Exception: {e}")
                print()
        else:
            print(f"Test {i}: Image not found - {img_path}")
            print()

if __name__ == "__main__":
    test_detection()