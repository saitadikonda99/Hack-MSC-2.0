#!/bin/bash

# ML Model Setup Script for CivicIndia
echo "Setting up ML model dependencies..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python3 is not installed. Please install Python3 first."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
python -m pip install --upgrade pip

# Install dependencies
echo "Installing ML dependencies..."
pip install -r requirements.txt

echo "Setup completed!"
echo ""
echo "To train your custom pothole model, run:"
echo "  source venv/bin/activate"
echo "  python train_pothole_model.py"
echo ""
echo "To test the detection, run:"
echo "  source venv/bin/activate"
echo "  python detect.py /path/to/your/image.jpg"