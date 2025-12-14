#!/bin/bash
# Run Advanced AI Detection on a file or directory

if [ -z "$1" ]; then
    echo "Usage: $0 <image_path_or_directory>"
    exit 1
fi

TARGET="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PYTHON="$SCRIPT_DIR/venv/bin/python"
DETECTOR_SCRIPT="$SCRIPT_DIR/advanced_detector/ensemble_detector.py"

if [ -d "$TARGET" ]; then
    echo "📂 Scanning directory: $TARGET"
    find "$TARGET" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) -exec "$VENV_PYTHON" "$DETECTOR_SCRIPT" "{}" \;
else
    echo "🖼️  Scanning file: $TARGET"
    "$VENV_PYTHON" "$DETECTOR_SCRIPT" "$TARGET"
fi
