#!/bin/bash
# Setup AI Detection Environment

echo "🔧 Setting up AI Detection Environment..."

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "⬇️  Installing dependencies..."
pip install -r requirements.txt

echo "✅ Setup complete!"
echo "👉 Run './run_advanced_detection.sh <image>' to test."
