# CivicIndia ML Model - Pothole Detection

This directory contains the machine learning components for pothole detection in the CivicIndia platform.

## Features

- **Custom Pothole Detection**: Trained specifically on your pothole dataset
- **Advanced Severity Analysis**: Calculates severity based on confidence, size, and position
- **Fallback Detection**: Multiple detection methods for reliability
- **Real-time Processing**: Optimized for web application integration

## Setup

### 1. Install Dependencies

Run the setup script to install all required dependencies:

```bash
cd ml-model
./setup.sh
```

Or install manually:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Train Custom Model (Optional)

If you want to retrain the model with your pothole dataset:

```bash
source venv/bin/activate
python train_pothole_model.py
```

This will:
- Convert XML annotations to YOLO format
- Split dataset into train/validation sets
- Train a custom YOLOv8 model
- Save the trained model as `pothole_yolov8s.pt`

### 3. Test Detection

Test the detection on a sample image:

```bash
source venv/bin/activate
python detect.py /path/to/your/image.jpg
```

## Model Architecture

### Custom Model Training
- **Base Model**: YOLOv8s (Small variant for faster inference)
- **Dataset**: 665 pothole images with XML annotations
- **Training Split**: 80% training, 20% validation
- **Epochs**: 50 with early stopping (patience=10)
- **Image Size**: 640x640 pixels

### Detection Pipeline

1. **Primary**: Custom trained pothole model
2. **Fallback**: Pre-trained YOLOv8s with civic issue mapping
3. **Emergency**: OpenCV-based edge detection analysis

### Severity Calculation

The severity score (1-10) is calculated using:

```python
# For custom model
conf_score = confidence * 3        # 0-3 points
area_score = min(area * 10, 4)     # 0-4 points  
position_score = 3 - distance_from_center * 6  # 0-3 points
severity = min(10.0, max(3.0, total_score))
```

Factors considered:
- **Confidence**: Model's confidence in detection
- **Size**: Larger potholes are more severe
- **Position**: Central potholes affect traffic more

## Integration with Next.js

The detection script is called from the Next.js API route:

```javascript
// In route.ts
const { stdout } = await execAsync(`python ${mlScript} ${imagePath}`);
const result = JSON.parse(stdout);
```

Returns JSON format:
```json
{
  "issueType": "pothole",
  "severity": 7.5,
  "confidence": 0.85
}
```

## Dataset Structure

```
data/pathholes_Dataset/
├── images/           # 665 pothole images (.png)
├── annotations/      # XML annotation files
└── dataset.yaml      # YOLO configuration (auto-generated)
```

## Model Files

- `pothole_yolov8s.pt`: Custom trained model (generated after training)
- `yolov8s.pt`: Pre-trained YOLO model (downloaded automatically)
- `train_pothole_model.py`: Training script
- `detect.py`: Detection script used by the web app

## Troubleshooting

### Common Issues

1. **YOLO not found**: Run `pip install ultralytics`
2. **CUDA errors**: Set `device='cpu'` in training script
3. **Memory issues**: Reduce batch size in training
4. **Model not found**: Run training script first

### Performance Optimization

- **GPU Training**: Change `device='cpu'` to `device='cuda'` if GPU available
- **Batch Size**: Increase for faster training (if memory allows)
- **Image Size**: Reduce to 416x416 for faster inference

## API Reference

### Training Function
```python
train_custom_model()
# Returns: path to trained model
```

### Detection Function
```python
detect_with_custom_model(model, image_path)
# Returns: {"issueType": str, "severity": float, "confidence": float}
```

### Fallback Analysis
```python
fallback_image_analysis(image_path)
# Returns: {"issueType": str, "severity": float}
```

## Future Improvements

1. **Multi-class Detection**: Extend to detect multiple civic issues
2. **Severity Heatmaps**: Generate visual severity maps
3. **Temporal Analysis**: Track pothole growth over time
4. **Mobile Optimization**: Convert to TensorFlow Lite for mobile apps
5. **Real-time Streaming**: Process video feeds from traffic cameras