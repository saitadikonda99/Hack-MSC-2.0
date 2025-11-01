#!/usr/bin/env python3
"""
Test script to validate ML model setup and functionality
"""

import os
import sys
import json
import subprocess
from pathlib import Path

def test_dependencies():
    """Test if all required dependencies are installed"""
    print("Testing dependencies...")
    
    try:
        import cv2
        print("✓ OpenCV installed")
    except ImportError:
        print("✗ OpenCV not found")
        return False
    
    try:
        import numpy as np
        print("✓ NumPy installed")
    except ImportError:
        print("✗ NumPy not found")
        return False
    
    try:
        from ultralytics import YOLO
        print("✓ Ultralytics YOLO installed")
    except ImportError:
        print("✗ Ultralytics not found")
        return False
    
    return True

def test_dataset():
    """Test if dataset is accessible"""
    print("\\nTesting dataset...")
    
    dataset_path = Path("../data/pathholes_Dataset")
    images_path = dataset_path / "images"
    annotations_path = dataset_path / "annotations"
    
    if not dataset_path.exists():
        print("✗ Dataset directory not found")
        return False
    
    if not images_path.exists():
        print("✗ Images directory not found")
        return False
    
    if not annotations_path.exists():
        print("✗ Annotations directory not found")
        return False
    
    # Count files
    images = list(images_path.glob("*.png"))
    annotations = list(annotations_path.glob("*.xml"))
    
    print(f"✓ Found {len(images)} images")
    print(f"✓ Found {len(annotations)} annotations")
    
    if len(images) == 0 or len(annotations) == 0:
        print("✗ Dataset appears to be empty")
        return False
    
    return True

def test_detection():
    """Test detection functionality"""
    print("\\nTesting detection...")
    
    # Find a test image
    test_image = None
    dataset_images = Path("../data/pathholes_Dataset/images")
    if dataset_images.exists():
        images = list(dataset_images.glob("*.png"))
        if images:
            test_image = str(images[0])
    
    if not test_image:
        print("✗ No test image found")
        return False
    
    try:
        # Test detection script
        result = subprocess.run([
            sys.executable, "detect.py", test_image
        ], capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            try:
                output = json.loads(result.stdout)
                print(f"✓ Detection successful: {output}")
                return True
            except json.JSONDecodeError:
                print(f"✗ Invalid JSON output: {result.stdout}")
                return False
        else:
            print(f"✗ Detection failed: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("✗ Detection timed out")
        return False
    except Exception as e:
        print(f"✗ Detection error: {e}")
        return False

def test_model_files():
    """Test model file availability"""
    print("\\nTesting model files...")
    
    custom_model = Path("pothole_yolov8s.pt")
    if custom_model.exists():
        print("✓ Custom pothole model found")
        return True
    else:
        print("⚠ Custom model not found - will use pre-trained model")
        print("  Run 'python train_pothole_model.py' to train custom model")
        return True  # Not a failure, just a note

def main():
    """Run all tests"""
    print("CivicIndia ML Model Test Suite")
    print("=" * 40)
    
    tests = [
        ("Dependencies", test_dependencies),
        ("Dataset", test_dataset),
        ("Model Files", test_model_files),
        ("Detection", test_detection),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\\n[{test_name.upper()}]")
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"✗ Test failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\\n" + "=" * 40)
    print("TEST SUMMARY")
    print("=" * 40)
    
    passed = 0
    for test_name, success in results:
        status = "PASS" if success else "FAIL"
        print(f"{test_name:15} {status}")
        if success:
            passed += 1
    
    print(f"\\nPassed: {passed}/{len(results)}")
    
    if passed == len(results):
        print("\\n🎉 All tests passed! ML model is ready to use.")
    else:
        print("\\n⚠️  Some tests failed. Check the output above for details.")
        print("\\nCommon fixes:")
        print("- Run './setup.sh' to install dependencies")
        print("- Ensure dataset is in correct location")
        print("- Check Python environment activation")

if __name__ == "__main__":
    main()