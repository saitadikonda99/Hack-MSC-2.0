# ml-model/detect.py
import sys
import json
import os
from pathlib import Path
import cv2
import numpy as np

def load_model():
    """Load the appropriate YOLO model"""
    try:
        from ultralytics import YOLO
        
        # Try to load custom pothole model first
        custom_model_path = "./pothole_yolov8s.pt"
        if os.path.exists(custom_model_path):
            print(f"Loading custom pothole model: {custom_model_path}", file=sys.stderr)
            return YOLO(custom_model_path), "custom"
        else:
            print("Custom model not found, using pre-trained YOLOv8s", file=sys.stderr)
            return YOLO("yolov8s.pt"), "pretrained"
            
    except ImportError:
        print("YOLO not available, using fallback detection", file=sys.stderr)
        return None, "fallback"

def detect_with_custom_model(model, image_path):
    """Detect potholes using custom trained model"""
    try:
        results = model(image_path, save=False, verbose=False)
        result = results[0]
        
        if result.boxes is not None and len(result.boxes) > 0:
            # Get the detection with highest confidence
            best_conf = 0
            best_detection = None
            
            for box in result.boxes:
                conf = float(box.conf[0])
                if conf > best_conf:
                    best_conf = conf
                    best_detection = box
            
            if best_detection is not None and best_conf > 0.3:  # Lower threshold for custom model
                # Calculate severity based on confidence and bounding box area
                bbox = best_detection.xywh[0].cpu().numpy()
                area = bbox[2] * bbox[3]  # normalized width * height
                
                # Advanced severity calculation
                # Base severity on confidence (30%), area (40%), and position (30%)
                conf_score = best_conf * 3  # 0-3 points
                area_score = min(area * 10, 4)  # 0-4 points (larger potholes = more severe)
                
                # Position score (center of image = more severe)
                center_x, center_y = bbox[0], bbox[1]
                distance_from_center = np.sqrt((center_x - 0.5)**2 + (center_y - 0.5)**2)
                position_score = max(0, 3 - distance_from_center * 6)  # 0-3 points
                
                total_score = conf_score + area_score + position_score
                severity = round(min(10.0, max(3.0, total_score)), 1)
                
                return {"issueType": "pothole", "severity": severity, "confidence": best_conf}
        
        return {"issueType": "unknown", "severity": 5.0, "confidence": 0.0}
        
    except Exception as e:
        print(f"Error in custom model detection: {e}", file=sys.stderr)
        return {"issueType": "unknown", "severity": 5.0, "confidence": 0.0}

def detect_with_pretrained_model(model, image_path):
    """Detect using pre-trained model with fallback logic"""
    try:
        results = model(image_path, save=False, verbose=False)
        result = results[0]
        
        # Generic labels for pretrained model
        labels = ["person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", 
                 "truck", "boat", "traffic light", "fire hydrant", "stop sign", 
                 "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", 
                 "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella"]
        
        issue_type = "unknown"
        severity = 5.0
        
        if result.boxes is not None and len(result.boxes) > 0:
            for box in result.boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                
                if conf > 0.5:
                    # Map detections to civic issues
                    if cls in [2, 3, 5, 7]:  # car, motorcycle, bus, truck
                        issue_type = "traffic"
                        severity = round(4 + conf * 3, 1)
                    elif cls in [9, 11]:  # traffic light, stop sign
                        issue_type = "traffic"
                        severity = round(6 + conf * 2, 1)
                    else:
                        issue_type = "other"
                        severity = round(5 + conf * 2, 1)
                    break
        
        return {"issueType": issue_type, "severity": severity}
        
    except Exception as e:
        print(f"Error in pretrained model detection: {e}", file=sys.stderr)
        return {"issueType": "unknown", "severity": 5.0}

def fallback_image_analysis(image_path):
    """Fallback analysis using OpenCV when YOLO is not available"""
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return {"issueType": "unknown", "severity": 5.0}
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (15, 15), 0)
        
        # Detect edges
        edges = cv2.Canny(blurred, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Analyze contours for pothole-like shapes
        pothole_score = 0
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 500:  # Minimum area threshold
                # Calculate circularity (potholes tend to be roughly circular)
                perimeter = cv2.arcLength(contour, True)
                if perimeter > 0:
                    circularity = 4 * np.pi * area / (perimeter * perimeter)
                    if 0.3 < circularity < 1.2:  # Rough circle range
                        pothole_score += circularity * (area / 10000)
        
        if pothole_score > 0.1:
            severity = round(min(9.0, max(4.0, 5 + pothole_score * 3)), 1)
            return {"issueType": "pothole", "severity": severity}
        else:
            # Check for other patterns
            # High edge density might indicate garbage or debris
            edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
            if edge_density > 0.05:
                return {"issueType": "garbage", "severity": 6.0}
            else:
                return {"issueType": "unknown", "severity": 5.0}
                
    except Exception as e:
        print(f"Error in fallback analysis: {e}", file=sys.stderr)
        return {"issueType": "unknown", "severity": 5.0}

def main():
    if len(sys.argv) != 2:
        print(json.dumps({"issueType": "unknown", "severity": 5.0}))
        sys.exit()

    image_path = sys.argv[1]
    
    # Check if image exists
    if not os.path.exists(image_path):
        print(json.dumps({"issueType": "unknown", "severity": 5.0}))
        sys.exit()
    
    # Load model
    model, model_type = load_model()
    
    # Perform detection based on available model
    if model_type == "custom":
        result = detect_with_custom_model(model, image_path)
    elif model_type == "pretrained":
        result = detect_with_pretrained_model(model, image_path)
    else:
        result = fallback_image_analysis(image_path)
    
    # Output result
    print(json.dumps(result))

if __name__ == "__main__":
    main()