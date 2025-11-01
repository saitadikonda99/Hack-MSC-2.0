# ml-model/train_pothole_model.py
import os
import sys
import json
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path
from ultralytics import YOLO
import yaml

def xml_to_yolo(xml_path, img_width, img_height):
    """Convert XML annotation to YOLO format"""
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()
        
        annotations = []
        for obj in root.findall('object'):
            bbox = obj.find('bndbox')
            if bbox is not None:
                try:
                    xmin = float(bbox.find('xmin').text)
                    ymin = float(bbox.find('ymin').text)
                    xmax = float(bbox.find('xmax').text)
                    ymax = float(bbox.find('ymax').text)
                    
                    # Validate bounding box
                    if xmin >= xmax or ymin >= ymax:
                        continue
                    
                    # Convert to YOLO format (normalized center x, center y, width, height)
                    x_center = (xmin + xmax) / (2 * img_width)
                    y_center = (ymin + ymax) / (2 * img_height)
                    width = (xmax - xmin) / img_width
                    height = (ymax - ymin) / img_height
                    
                    # Ensure normalized values are within [0, 1]
                    x_center = max(0, min(1, x_center))
                    y_center = max(0, min(1, y_center))
                    width = max(0, min(1, width))
                    height = max(0, min(1, height))
                    
                    # Class 0 for pothole
                    annotations.append(f"0 {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}")
                except (ValueError, AttributeError, TypeError):
                    continue
        
        return annotations
    except Exception as e:
        print(f"Error parsing {xml_path}: {e}")
        return []

def prepare_yolo_dataset():
    """Prepare the dataset in YOLO format"""
    
    # Paths
    dataset_root = Path("../data/pathholes_Dataset")
    images_dir = dataset_root / "images"
    annotations_dir = dataset_root / "annotations"
    
    # Create YOLO dataset structure
    yolo_dataset_root = Path("./yolo_dataset")
    yolo_dataset_root.mkdir(exist_ok=True)
    
    # Create train/val split directories
    for split in ['train', 'val']:
        (yolo_dataset_root / split / 'images').mkdir(parents=True, exist_ok=True)
        (yolo_dataset_root / split / 'labels').mkdir(parents=True, exist_ok=True)
    
    # Get all image files
    image_files = list(images_dir.glob("*.png"))
    print(f"Found {len(image_files)} images")
    
    # Split dataset (80% train, 20% val)
    split_idx = int(0.8 * len(image_files))
    train_images = image_files[:split_idx]
    val_images = image_files[split_idx:]
    
    print(f"Train: {len(train_images)}, Val: {len(val_images)}")
    
    # Process each split
    for split, images in [('train', train_images), ('val', val_images)]:
        for img_path in images:
            # Copy image
            dest_img = yolo_dataset_root / split / 'images' / img_path.name
            shutil.copy2(img_path, dest_img)
            
            # Convert annotation
            xml_path = annotations_dir / f"{img_path.stem}.xml"
            if xml_path.exists():
                # Get image dimensions from XML
                tree = ET.parse(xml_path)
                root = tree.getroot()
                size = root.find('size')
                img_width = int(size.find('width').text)
                img_height = int(size.find('height').text)
                
                # Convert to YOLO format
                yolo_annotations = xml_to_yolo(xml_path, img_width, img_height)
                
                # Save YOLO annotation
                label_path = yolo_dataset_root / split / 'labels' / f"{img_path.stem}.txt"
                with open(label_path, 'w') as f:
                    f.write('\\n'.join(yolo_annotations))
    
    # Create dataset YAML config
    dataset_config = {
        'path': str(yolo_dataset_root.absolute()),
        'train': 'train',
        'val': 'val',
        'names': {0: 'pothole'},
        'nc': 1  # number of classes
    }
    
    config_path = yolo_dataset_root / 'dataset.yaml'
    with open(config_path, 'w') as f:
        yaml.dump(dataset_config, f, default_flow_style=False)
    
    print(f"Dataset prepared at: {yolo_dataset_root}")
    print(f"Config saved at: {config_path}")
    return str(config_path)

def train_custom_model():
    """Train custom YOLO model for pothole detection"""
    
    print("Preparing YOLO dataset...")
    config_path = prepare_yolo_dataset()
    
    print("Starting training...")
    
    # Load pre-trained YOLOv8 model
    model = YOLO('yolov8s.pt')
    
    # Train the model
    results = model.train(
        data=config_path,
        epochs=50,
        imgsz=640,
        batch=16,
        name='pothole_detection',
        patience=10,
        save=True,
        verbose=True,
        device='cpu',  # Change to 'cuda' if you have GPU
        plots=True,
        val=True,
        split=0.2,
        cache=False,
        workers=2
    )
    
    print("Training completed!")
    print(f"Best model saved at: {model.trainer.best}")
    
    # Copy the best model to our ml-model directory
    best_model_path = Path(model.trainer.best)
    custom_model_path = Path("./pothole_yolov8s.pt")
    shutil.copy2(best_model_path, custom_model_path)
    
    print(f"Custom model copied to: {custom_model_path}")
    return str(custom_model_path)

def test_model(model_path, test_image_path=None):
    """Test the trained model"""
    model = YOLO(model_path)
    
    if test_image_path is None:
        # Use a sample from the dataset
        test_image_path = "../data/pathholes_Dataset/images/potholes0.png"
    
    if os.path.exists(test_image_path):
        results = model(test_image_path)
        
        for result in results:
            boxes = result.boxes
            if boxes is not None and len(boxes) > 0:
                for box in boxes:
                    conf = float(box.conf[0])
                    cls = int(box.cls[0])
                    print(f"Detected pothole with confidence: {conf:.3f}")
                    
                    # Calculate severity based on confidence and box size
                    bbox = box.xywh[0].cpu().numpy()
                    area = bbox[2] * bbox[3]  # width * height (normalized)
                    severity = min(10.0, max(3.0, 5 + conf * 3 + area * 2))
                    
                    print(f"Calculated severity: {severity:.1f}/10")
                    return {"issueType": "pothole", "severity": severity}
            else:
                print("No potholes detected")
                return {"issueType": "unknown", "severity": 5.0}
    else:
        print(f"Test image not found: {test_image_path}")
        return {"issueType": "unknown", "severity": 5.0}

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        # Test mode
        model_path = "./pothole_yolov8s.pt"
        if os.path.exists(model_path):
            test_image = sys.argv[2] if len(sys.argv) > 2 else None
            result = test_model(model_path, test_image)
            print(json.dumps(result))
        else:
            print(json.dumps({"issueType": "unknown", "severity": 5.0}))
    else:
        # Training mode
        try:
            model_path = train_custom_model()
            print("\\n" + "="*50)
            print("TRAINING COMPLETE!")
            print("="*50)
            print(f"Custom model saved at: {model_path}")
            
            # Test the model
            print("\\nTesting the model...")
            result = test_model(model_path)
            print(f"Test result: {result}")
            
        except Exception as e:
            print(f"Training failed: {e}")
            sys.exit(1)