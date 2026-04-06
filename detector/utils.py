import cv2
import numpy as np
import os
from django.conf import settings
import tensorflow as tf
from tensorflow.keras.models import load_model

IMG_SIZE = 224

_MODELS = {
    'Custom CNN': {'path': 'custom_cnn.keras', 'acc': 0.90, 'model': None},
    'VGG Style': {'path': 'vgg_style.keras', 'acc': 0.92, 'model': None},
    'ResNet Style': {'path': 'resnet_style.keras', 'acc': 0.94, 'model': None},
    'DenseNet Style': {'path': 'densenet_style.keras', 'acc': 0.95, 'model': None},
}

def load_all_models():
    """Loads all 4 models securely."""
    tf.config.set_visible_devices([], 'GPU')
    models_dir = os.path.join(settings.BASE_DIR, 'Models')
    
    for key, info in _MODELS.items():
        if info['model'] is None:
            path = os.path.join(models_dir, info['path'])
            if os.path.exists(path):
                try:
                    info['model'] = load_model(path, compile=False)
                    print(f"Loaded {key} from {path}")
                except Exception as e:
                    print(f"Error loading {key}: {e}")
            else:
                print(f"Model {key} not found at {path}")

def apply_clahe(img_gray):
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return clahe.apply(img_gray)

def preprocess_image(img_path):
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError("Could not read the uploaded image.")
    img = apply_clahe(img)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = np.array(img, dtype=np.float32) / 255.0
    img = img.reshape(1, IMG_SIZE, IMG_SIZE, 1)
    return img

def predict_pneumonia(img_path):
    load_all_models()
    
    loaded_models = {k: v for k, v in _MODELS.items() if v['model'] is not None}
    if not loaded_models:
        return {
            "status": "error", 
            "message": "No models found. Please train the models and save them to the Models/ folder."
        }
    
    try:
        processed_img = preprocess_image(img_path)
        
        individual_results = {}
        weighted_sum = 0
        total_weight = 0
        
        for name, info in loaded_models.items():
            prob = info['model'].predict(processed_img, verbose=0)[0][0]
            # 0 is PNEUMONIA, 1 is NORMAL
            pred_class = 'Normal' if prob > 0.5 else 'Pneumonia'
            conf = float(prob) if pred_class == 'Normal' else 1.0 - float(prob)
            
            individual_results[name] = {
                'prediction': pred_class,
                'confidence': round(conf * 100, 1),
                'probability': float(prob)
            }
            
            weight = info['acc']
            weighted_sum += float(prob) * weight
            total_weight += weight
            
        ensemble_prob = weighted_sum / total_weight if total_weight > 0 else 0
        ensemble_class = 'Normal' if ensemble_prob > 0.5 else 'Pneumonia'
        ensemble_conf = ensemble_prob if ensemble_class == 'Normal' else 1.0 - ensemble_prob
        
        return {
            "status": "success",
            "prediction": ensemble_class,
            "confidence": round(ensemble_conf * 100, 2),
            "models": individual_results
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
