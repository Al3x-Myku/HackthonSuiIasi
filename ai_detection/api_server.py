from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import numpy as np
from PIL import Image

# Add current directory to path so we can import advanced_detector
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from advanced_detector.ensemble_detector import EnsembleDetector

app = Flask(__name__)
# Enable CORS for all routes to allow requests from the frontend
CORS(app)

print("⏳ Initializing AI Detector... usage will be available shortly.")
detector = EnsembleDetector()
print("✅ AI Detector Ready!")

@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400

    try:
        # Open image directly from the file stream
        img = Image.open(file.stream).convert('RGB')
        
        # Run prediction
        # predict returns: final_score, ufd_score, local_score, nano_score, lnp_score, ela_score
        final_score, ufd, local, nano, lnp, ela = detector.predict(img)
        
        is_fake = final_score > 0.5
        label = "AI-Generated" if is_fake else "Real Photo"
        
        return jsonify({
            'is_fake': bool(is_fake),
            'label': label,
            'score': float(final_score), # Included for debugging, frontend should hide it
            'details': {
                'ufd_score': float(ufd),
                'local_score': float(local),
                'nano_score': float(nano)
            }
        })

    except Exception as e:
        print(f"Error processing image: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
