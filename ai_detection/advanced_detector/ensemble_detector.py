#!/usr/bin/env python3
"""
Advanced AI Image Detector Ensemble
===================================
Combines state-of-the-art models for robust AI detection.

Models:
1. UniversalFakeDetect (CVPR 2023) - General purpose
2. TruFor (CVPR 2023) - For manipulation/editing (TODO)
3. CO-SPY (CVPR 2025) - For generation (TODO)

Usage:
  python ensemble_detector.py path/to/image.jpg
"""

import os
import sys
import argparse
import torch
import numpy as np
from PIL import Image
import torchvision.transforms as transforms

# Add UniversalFakeDetect to path
REPO_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'repos')
UFD_PATH = os.path.join(REPO_ROOT, 'UniversalFakeDetect')
sys.path.append(UFD_PATH)

# Import UniversalFakeDetect models
try:
    from models import get_model
except ImportError:
    print("⚠️ UniversalFakeDetect not found. Please clone the repo.")
    sys.exit(1)

# Configuration
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
UFD_WEIGHTS = os.path.join(UFD_PATH, 'pretrained_weights', 'fc_weights.pth')
UFD_ARCH = 'CLIP:ViT-L/14'

# Normalization for CLIP
MEAN = [0.48145466, 0.4578275, 0.40821073]
STD = [0.26862954, 0.26130258, 0.27577711]

class UniversalFakeDetectWrapper:
    def __init__(self):
        print(f"   Loading UniversalFakeDetect ({UFD_ARCH})...")
        self.model = get_model(UFD_ARCH)
        
        if os.path.exists(UFD_WEIGHTS):
            state_dict = torch.load(UFD_WEIGHTS, map_location='cpu')
            self.model.fc.load_state_dict(state_dict)
        else:
            print(f"   ❌ Weights not found at {UFD_WEIGHTS}")
            raise FileNotFoundError("UFD Weights missing")
            
        self.model.to(DEVICE)
        self.model.eval()
        
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=MEAN, std=STD),
        ])
        print("   ✅ UniversalFakeDetect loaded")

    def predict(self, pil_img):
        img_tensor = self.transform(pil_img).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            # Output is logit, apply sigmoid
            logit = self.model(img_tensor)
            prob = logit.sigmoid().item()
        return prob

from scipy.stats import skew
import cv2
import io

# ... (Previous imports) ...

def extract_noise_residual(image):
    """Extract noise residual using bilateral filter."""
    try:
        img_float = image.astype(np.float32)
        denoised = cv2.bilateralFilter(img_float, 9, 75, 75)
        noise = img_float - denoised
        return noise
    except Exception:
        from scipy.ndimage import gaussian_filter
        img_float = image.astype(np.float32)
        denoised = gaussian_filter(img_float, sigma=2)
        return img_float - denoised

def analyze_lnp(image):
    """Local Noise Pattern (LNP) Analysis."""
    noise = extract_noise_residual(image)
    noise_flat = noise.flatten()
    
    metrics = {
        'noise_uniformity': float(np.std([np.std(noise[i::8, j::8]) for i in range(8) for j in range(8)])),
        'noise_skewness': float(skew(noise_flat)),
        'noise_kurtosis': float(calc_kurtosis(noise_flat))
    }
    
    ai_score = 0.0
    if metrics['noise_uniformity'] < 5.0: ai_score += 0.3
    if abs(metrics['noise_skewness']) < 0.5: ai_score += 0.2
    if metrics['noise_kurtosis'] < 2.0: ai_score += 0.2
    
    return ai_score

def analyze_ela(image, quality=90):
    """Error Level Analysis (ELA)."""
    img_pil = Image.fromarray(image)
    buffer = io.BytesIO()
    img_pil.save(buffer, format='JPEG', quality=quality)
    buffer.seek(0)
    recompressed = np.array(Image.open(buffer))
    
    ela = np.abs(image.astype(np.float32) - recompressed.astype(np.float32))
    ela_flat = ela.flatten()
    
    metrics = {
        'ela_uniformity': float(np.std([np.mean(ela[i:i+32, j:j+32]) 
                                        for i in range(0, ela.shape[0]-32, 32) 
                                        for j in range(0, ela.shape[1]-32, 32)])),
        'ela_std': float(np.std(ela_flat))
    }
    
    ai_score = 0.0
    if metrics['ela_uniformity'] < 3.0: ai_score += 0.3
    if metrics['ela_std'] < 5.0: ai_score += 0.2
    
    return ai_score

# ... (Existing functions) ...

import joblib
from scipy.fftpack import dct, fft2
from scipy.stats import kurtosis as calc_kurtosis
from scipy.ndimage import uniform_filter
from scipy.signal import correlate2d
import pywt
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights
import torch.nn as nn

# Local Model Paths
LOCAL_MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'model')
LOCAL_MODEL_PATH = os.path.join(LOCAL_MODEL_DIR, 'ai_detector_model.pkl')
LOCAL_SCALER_PATH = os.path.join(LOCAL_MODEL_DIR, 'ai_detector_scaler.pkl')
LOCAL_CONFIG_PATH = os.path.join(LOCAL_MODEL_DIR, 'config.pkl')

def wiener_adaptive(data, noise_var):
    result = np.zeros_like(data, dtype=np.float64)
    for window_size in [3, 5, 7, 9]:
        local_mean = uniform_filter(data.astype(np.float64), size=window_size)
        local_sq_mean = uniform_filter((data**2).astype(np.float64), size=window_size)
        local_var = np.maximum(local_sq_mean - local_mean**2, 0)
        with np.errstate(divide='ignore', invalid='ignore'):
            filtered = np.where(local_var > noise_var, data - local_mean * (noise_var / (local_var + 1e-10)), np.zeros_like(data))
        result = np.minimum(result, filtered) if window_size > 3 else filtered
    return result

def noise_extract_prnu(image):
    if len(image.shape) == 3: gray = np.mean(image, axis=2).astype(np.float64)
    else: gray = image.astype(np.float64)
    try: wlet = pywt.wavedec2(gray, 'db4', level=4)
    except: wlet = pywt.wavedec2(gray, 'db4', level=2)
    finest_detail = wlet[-1][0]
    noise_var = (np.median(np.abs(finest_detail)) / 0.6745) ** 2
    for level in range(1, len(wlet)):
        details = list(wlet[level])
        for i in range(3): details[i] = wiener_adaptive(details[i], noise_var)
        wlet[level] = tuple(details)
    wlet[0] = np.zeros_like(wlet[0])
    noise = pywt.waverec2(wlet, 'db4')
    return noise[:gray.shape[0], :gray.shape[1]]

def extract_prnu_features(image):
    noise = noise_extract_prnu(image)
    noise_std = np.std(noise)
    noise_kurt = calc_kurtosis(noise.flatten())
    noise_fft = np.fft.fftshift(np.abs(fft2(noise)))
    h, w = noise_fft.shape
    cy, cx = h // 2, w // 2
    y, x = np.ogrid[:h, :w]
    r = np.sqrt((x - cx)**2 + (y - cy)**2)
    max_r = min(cx, cy)
    mid_mask = (r > 0.3 * max_r) & (r < 0.7 * max_r)
    mid_freq = np.mean(noise_fft[mid_mask]) if np.any(mid_mask) else 0
    high_mask = r > 0.7 * max_r
    high_freq = np.mean(noise_fft[high_mask]) if np.any(high_mask) else 0
    try:
        center_size = min(64, h, w)
        crop = noise[cy-center_size//2:cy+center_size//2, cx-center_size//2:cx+center_size//2]
        autocorr = correlate2d(crop, crop, mode='same')
        autocorr_norm = autocorr / (np.max(autocorr) + 1e-10)
        autocorr_norm[center_size//2, center_size//2] = 0
        autocorr_mean = np.mean(np.abs(autocorr_norm))
    except: autocorr_mean = 0.0
    return np.array([noise_std, noise_kurt, mid_freq, high_freq, autocorr_mean], dtype=np.float32)

def extract_freq_features(img_array):
    gray = np.mean(img_array, axis=2).astype(np.float32)
    dct_coeffs = dct(dct(gray.T, norm='ortho').T, norm='ortho')
    h, w = dct_coeffs.shape
    dct_feats = [np.mean(dct_coeffs[:h//4, :w//4]), np.std(dct_coeffs[:h//4, :w//4]), np.mean(dct_coeffs[h//2:, w//2:]), np.std(dct_coeffs[h//2:, w//2:])]
    fft_mag = np.abs(np.fft.fftshift(fft2(gray)))
    log_mag = np.log(fft_mag + 1)
    fft_feats = [np.mean(log_mag), np.std(log_mag), np.mean(log_mag[h//2-20:h//2+20, w//2-20:w//2+20]), np.mean(log_mag[:20, :]) + np.mean(log_mag[-20:, :])]
    return np.array(dct_feats + fft_feats, dtype=np.float32)

class LocalModelWrapper:
    def __init__(self):
        print(f"   Loading Local Fine-Tuned Model...")
        self.clf = joblib.load(LOCAL_MODEL_PATH)
        self.scaler = joblib.load(LOCAL_SCALER_PATH)
        self.config = joblib.load(LOCAL_CONFIG_PATH)
        
        # Handle Ensemble
        if hasattr(self.clf, 'estimators_'):
            pass # Use as is
            
        self.efficientnet = efficientnet_b0(weights=EfficientNet_B0_Weights.IMAGENET1K_V1)
        self.efficientnet.classifier = nn.Identity()
        self.efficientnet = self.efficientnet.to(DEVICE)
        self.efficientnet.eval()
        
        self.img_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])
        print("   ✅ Local Model loaded")

    def predict(self, pil_img):
        img_array = np.array(pil_img.resize((224, 224)))
        
        freq_feat = extract_freq_features(img_array)
        prnu_feat = extract_prnu_features(img_array)
        
        tensor = self.img_transform(pil_img).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            emb_feat = self.efficientnet(tensor).cpu().numpy().flatten()
            
        full = np.concatenate([freq_feat, prnu_feat, emb_feat])
        
        expected = self.config.get('features', full.shape[0])
        if full.shape[0] > expected: full = full[:expected]
        elif full.shape[0] < expected: full = np.concatenate([full, np.zeros(expected - full.shape[0])])
            
        feat_scaled = self.scaler.transform(full.reshape(1, -1))
        proba = self.clf.predict_proba(feat_scaled)[0]
        return proba[1] # Probability of AI

def analyze_fft(image):
    """FFT Spectral Analysis for Grid Artifacts."""
    # Resize to fixed size for consistent analysis
    img_pil = Image.fromarray(image).convert('L').resize((512, 512))
    data = np.array(img_pil)
    
    f = fft2(data)
    fshift = np.fft.fftshift(f)
    magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1)
    
    # Calculate peaks (exclude DC center)
    h, w = magnitude_spectrum.shape
    cy, cx = h//2, w//2
    mask = np.ones_like(magnitude_spectrum)
    mask[cy-5:cy+5, cx-5:cx+5] = 0
    
    masked_spectrum = magnitude_spectrum * mask
    mean = np.mean(masked_spectrum)
    std = np.std(masked_spectrum)
    max_val = np.max(masked_spectrum)
    
    if std == 0: return 0.0
    z_score = (max_val - mean) / std
    
    # AI often has Z-Score > 5.5 due to grid artifacts
    if z_score > 5.5: return 0.5
    if z_score > 5.0: return 0.2
    return 0.0

class EnsembleDetector:
    def __init__(self):
        print("🔧 Initializing Advanced Ensemble Detector...")
        self.ufd = UniversalFakeDetectWrapper()
        self.local = LocalModelWrapper()
        
    def predict(self, pil_img):
        # 1. UniversalFakeDetect
        ufd_score = self.ufd.predict(pil_img)
        
        # 2. Local Model
        local_score = self.local.predict(pil_img)
        
        # 3. Nano Banana Protocol
        img_array = np.array(pil_img.resize((224, 224))) # Keep 224 for LNP/ELA
        lnp_score = analyze_lnp(img_array)
        ela_score = analyze_ela(img_array)
        
        # FFT Analysis (needs larger size for better resolution)
        fft_score = analyze_fft(np.array(pil_img))
        
        # Combined Nano Score
        # Max possible: LNP(0.7) + ELA(0.5) + FFT(0.5) = 1.7
        nano_score = (lnp_score + ela_score + fft_score) / 1.5
        if nano_score > 1.0: nano_score = 1.0
        
        # Smart Ensemble Logic
        width, height = pil_img.size
        min_dim = min(width, height)
        ar = width / height
        
        final_score = 0.0
        
        if min_dim < 300:
            # Small images (<300px) mimic AI artifacts due to smoothing/downscaling.
            # Use STRICT thresholds. Ignore Nano Banana.
            if local_score > 0.85:
                final_score = local_score
            elif ufd_score > 0.5:
                final_score = ufd_score
            else:
                final_score = max(ufd_score, local_score * 0.5) # Likely Real
        elif ar < 0.6:
            # Mobile/Screenshot Aspect Ratio (9:16). Often triggers FP.
            # Use STRICT thresholds.
            if local_score > 0.85:
                final_score = local_score
            elif ufd_score > 0.5:
                final_score = ufd_score
            else:
                final_score = max(ufd_score, local_score * 0.5) # Likely Real
        else:
            # Normal Resolution & AR: Use full ensemble
            # 1. High Confidence Local
            if local_score > 0.85:
                final_score = local_score
            # 2. Strong Nano (>0.75)
            elif nano_score > 0.75:
                if local_score > 0.60:
                    final_score = nano_score
                else:
                    final_score = ufd_score
            # 3. Moderate Nano (>0.6)
            elif nano_score > 0.6:
                if local_score > 0.70:
                    final_score = nano_score
                else:
                    final_score = ufd_score
            # 4. UFD
            elif ufd_score > 0.5:
                final_score = ufd_score
            else:
                final_score = max(ufd_score, nano_score * 0.5) # Fallback
            
        return final_score, ufd_score, local_score, nano_score, lnp_score, ela_score

    def analyze(self, image_path):
        if not os.path.exists(image_path):
            print(f"❌ File not found: {image_path}")
            return

        try:
            pil_img = Image.open(image_path).convert('RGB')
            
            final_score, ufd_score, local_score, nano_score, lnp, ela = self.predict(pil_img)
            
            print("\n" + "="*60)
            print(f"🖼️  Image: {os.path.basename(image_path)}")
            print("-" * 60)
            
            print(f"   UniversalFakeDetect Score: {ufd_score:.4f}")
            print(f"   Local Fine-Tuned Score:    {local_score:.4f}")
            print(f"   Nano Banana Score:         {nano_score:.4f} (LNP: {lnp:.2f}, ELA: {ela:.2f})")
            print("-" * 60)
            
            is_fake = final_score > 0.5
            confidence = final_score if is_fake else 1 - final_score
            
            label = "AI-Generated 🤖" if is_fake else "Real Photo 📷"
            color = "\033[91m" if is_fake else "\033[92m"
            reset = "\033[0m"
            
            print(f"🏷️  Verdict: {color}{label}{reset}")
            print(f"📊 Confidence: {confidence*100:.1f}%")
            
            # Evidence
            if is_fake:
                if nano_score > 0.6:
                    print("   🔍 Evidence: Detected by Nano Banana Protocol (LNP/ELA Artifacts)")
                elif local_score > 0.85:
                    print("   🔍 Evidence: Detected by Local Model (Specific Artifacts)")
                elif ufd_score > 0.5:
                    print("   🔍 Evidence: Detected by UniversalFakeDetect (General Anomaly)")
            else:
                if nano_score > 0.6:
                    print("   🔍 Evidence: Moderate artifacts detected (Possible Compression or Editing)")
                elif ufd_score < 0.1 and nano_score < 0.3:
                    print("   🔍 Evidence: Confirmed Real by Multiple Models")
                else:
                    print("   🔍 Evidence: No significant anomalies detected")
                
            print("="*60 + "\n")
            
        except Exception as e:
            print(f"❌ Error processing image: {e}")

def main():
    parser = argparse.ArgumentParser(description="Advanced AI Image Detector")
    parser.add_argument("image_path", help="Path to the image file")
    args = parser.parse_args()
    
    detector = EnsembleDetector()
    detector.analyze(args.image_path)

if __name__ == "__main__":
    main()
