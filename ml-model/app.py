import os
from flask import Flask, request, jsonify
import time
from flask_cors import CORS
from PIL import Image
import io
import json
import base64
from dotenv import load_dotenv

# Load env variables
load_dotenv(override=True)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_PATH = os.getenv('MODEL_PATH', 'model.pth')
PORT = int(os.getenv('PORT', 5000))
UPLOAD_LIMIT = int(os.getenv('MAX_CONTENT_LENGTH', 5 * 1024 * 1024))

if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not loaded. AI fallback will be disabled.")

# Gemini client setup
gemini_client = None
try:
    from google import genai as new_genai
    gemini_client = new_genai.Client(api_key=GEMINI_API_KEY)
    print("Gemini client ready.")
except Exception as e:
    print(f"Gemini init failed: {e}")

# PyTorch setup
try:
    import torch
    import torch.nn as nn
    from torchvision import transforms, models
except ImportError:
    print("PyTorch not found. Running in dummy mode.")
    torch = None

app = Flask(__name__)
CORS(app)

# Limit upload size
app.config['MAX_CONTENT_LENGTH'] = UPLOAD_LIMIT

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

model = None
CLASS_NAMES = ['Early_Blight', 'Healthy', 'Late_Blight']
IMG_SIZE = 224

def load_model():
    global model, CLASS_NAMES
    try:
        if torch is not None and os.path.exists(MODEL_PATH):
            checkpoint = torch.load(MODEL_PATH, map_location=torch.device('cpu'))
            
            # Extract class names if they exist, otherwise fallback
            if isinstance(checkpoint, dict) and 'class_names' in checkpoint:
                CLASS_NAMES = checkpoint['class_names']
                state_dict = checkpoint['model_state_dict']
            else:
                state_dict = checkpoint
                # Keep default CLASS_NAMES

            model = models.mobilenet_v2(pretrained=False)
            model.classifier = nn.Sequential(
                nn.Dropout(0.3),
                nn.Linear(model.last_channel, len(CLASS_NAMES))
            )
            model.load_state_dict(state_dict)
            model.eval()
            print("PyTorch model loaded successfully. Classes:", CLASS_NAMES)
        else:
            print("model.pth not found. Running in dummy mode.")
    except Exception as e:
            print(f"Error loading model: {e}")

load_model()

def analyze_with_gemini(pil_img):
    # Fallback to Gemini if local model confidence is low
    if not gemini_client or not GEMINI_API_KEY:
        print("Gemini not available. Using local result.")
        return None

    print("Triggering Gemini fallback...")

    prompt = """Analyze this plant leaf image.
Identify if it is Early Blight, Late Blight, or Healthy.
Do NOT invent disease labels outside these categories. If the image does not fit these categories, is an unknown crop, or has an unsupported disease:
1. Set "disease" to "Unknown crop or unsupported disease detected"
2. Set "severity" to "Unknown"
3. Set "treatment" to "Image may belong to an unsupported crop or disease outside trained categories. Consult agricultural expert or upload a supported crop image."

Respond ONLY with a valid JSON object in this exact structure:
{
    "disease": "Early Blight or Late Blight or Healthy or Unknown crop or unsupported disease detected",
    "confidence": 90.0,
    "severity": "None or Mild or Moderate or Severe or Unknown",
    "treatment": "Treatment recommendations or general guidance in 1-2 sentences."
}"""

    models_to_try = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest']
    for model_name in models_to_try:
        try:
            print(f"Trying model: {model_name}")
            response = gemini_client.models.generate_content(
                model=model_name,
                contents=[prompt, pil_img]
            )
            result_text = response.text.strip()
            
            if result_text.startswith('```'):
                result_text = result_text.split('```')[1]
                if result_text.startswith('json'):
                    result_text = result_text[4:]
                    
            result = json.loads(result_text)
            print(f"Gemini result: {result.get('disease')} ({result.get('confidence')}%)")
            return result
            
        except Exception as e:
            err = str(e)
            if '429' in err or 'RESOURCE_EXHAUSTED' in err:
                print(f"{model_name} rate limited, skipping...")
                continue
            print(f"Gemini analysis failed: {e}")
            continue
            
    print("All models rate limited.")
    return None

def determine_severity_and_treatment(disease, confidence):
    if disease in ('Uncertain', 'Possible Unknown / Pest Damage', 'Unable to determine confidently') or confidence < 70:
        return 'Unknown', 'Consult an agricultural expert for diagnosis.'

    if disease == 'Healthy':
        return 'None', 'No treatment required. Continue regular maintenance.'

    severity = 'Severe' if confidence > 90 else ('Moderate' if confidence > 75 else 'Mild')

    treatments = {
        'Early_Blight': "Remove affected lower leaves. Apply copper fungicide.",
        'Late_Blight': "Apply Ridomil Gold or chlorothalonil. Remove infected plants."
    }
    
    treatment = treatments.get(disease, "Consult an expert for treatment.")
    return severity, treatment

@app.route('/infer', methods=['POST'])
def infer():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Only PNG, JPG, and JPEG are allowed."}), 400

    try:
        image = Image.open(file.stream).convert('RGB')

        disease_name = "Uncertain"
        confidence = 0.0
        top_2_predictions = []

        if model is not None and torch is not None:
            print("Running PyTorch model...")
            
            transform = transforms.Compose([
                transforms.Resize((IMG_SIZE, IMG_SIZE)),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406],
                                     [0.229, 0.224, 0.225])
            ])
            
            img_tensor = transform(image).unsqueeze(0)

            with torch.no_grad():
                logits = model(img_tensor)
                
                # Removed temperature scaling to restore proper confidence
                scaled_logits = logits
                probabilities = torch.softmax(scaled_logits, dim=1)
                
                top_prob, top_indices = torch.topk(probabilities, k=min(2, len(CLASS_NAMES)))
                confidence = top_prob[0][0].item() * 100
                predicted_class_index = top_indices[0][0].item()

                for i in range(top_prob.shape[1]):
                    c_idx = top_indices[0][i].item()
                    c_prob = top_prob[0][i].item() * 100
                    d_name = CLASS_NAMES[c_idx] if c_idx < len(CLASS_NAMES) else 'Unknown Disease'
                    top_2_predictions.append({"label": d_name.replace("_", " "), "confidence": round(c_prob, 1)})

            disease_name = CLASS_NAMES[predicted_class_index] if predicted_class_index < len(CLASS_NAMES) else 'Unknown Disease'
            print(f"Prediction: {disease_name} ({confidence:.1f}%)")

            if confidence < 70.0:
                print(f"Low confidence ({confidence:.1f}%). Falling back to AI for assistance.")
                # We do NOT set disease_name = "Uncertain" here. Keep the CNN prediction!
        else:
            import random
            img_rgb = image.convert('RGB')
            pixels = list(img_rgb.resize((10, 10)).getdata())
            avg_r = sum(p[0] for p in pixels) / len(pixels)
            avg_g = sum(p[1] for p in pixels) / len(pixels)
            avg_b = sum(p[2] for p in pixels) / len(pixels)

            disease_name = 'Healthy' if avg_g > avg_r and avg_g > avg_b else ('Late_Blight' if avg_r > 120 else 'Early_Blight')
            confidence = round(random.uniform(50.0, 75.0), 1)
            
            top_2_predictions = [{"label": disease_name.replace("_", " "), "confidence": confidence}]

        # Determine severity and treatment for the CNN's primary prediction
        severity, treatment = determine_severity_and_treatment(disease_name, confidence)

        # Fail-safe for low confidence (< 70%)
        if confidence < 70.0:
            disease_name = "Unable to determine confidently"
            severity = 'Unknown'
            treatment = 'Consult an agricultural expert for diagnosis.'

        response_data = {
            "disease": disease_name.replace("_", " "),
            "confidence": round(confidence, 1),
            "severity": severity,
            "treatment": treatment,
            "top_predictions": top_2_predictions,
            "source": "local_model"
        }

        # Add Gemini as a Supplementary Recommendation if confidence is low
        if confidence < 70.0 or disease_name == 'Uncertain' or disease_name == 'Unable to determine confidently':
            ai_result = analyze_with_gemini(image)
            if ai_result:
                # If confidence is under 70%, or Gemini flags it as unknown crop/disease,
                # we force the response fields to strictly match the requested behavior.
                if ai_result.get("disease") == "Unknown crop or unsupported disease detected":
                    response_data["ai_recommendation"] = {
                        "disease": "Unknown crop or unsupported disease detected",
                        "confidence": float(ai_result.get("confidence", 90.0)),
                        "severity": "Unknown",
                        "treatment": "Image may belong to an unsupported crop or disease outside trained categories. Consult agricultural expert or upload a supported crop image."
                    }
                else:
                    response_data["ai_recommendation"] = {
                        "disease": ai_result.get("disease", "Unknown").replace("_", " "),
                        "confidence": float(ai_result.get("confidence", 90.0)),
                        "severity": ai_result.get("severity", "Moderate"),
                        "treatment": ai_result.get("treatment", "Consult an expert.")
                    }
                response_data["source"] = "local_model_with_ai_assistance"

        return jsonify(response_data), 200
    except Exception as e:
        print(f"Inference error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    debug_mode = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')
    app.run(host='0.0.0.0', port=PORT, debug=debug_mode)
