# Smart Crop Disease Detection System

A SY project for MIT Academy of Engineering, School of Computer Engineering.
This is a complete MERN-like stack (React, Node, MongoDB) combined with a Python Machine Learning component (Flask + PyTorch MobileNetV2 Transfer Learning CNN) that analyzes crop leaves for diseases.

## Architecture & Workflow

1. **User (Farmer) Uploads Image**: Using the React UI.
2. **React -> Node.js**: Frontend sends FormData containing the image to the Node API (`/api/predict`).
3. **Node.js -> Flask**: Node saves the file locally using `multer` and proxies the image to the Python API (`/infer`).
4. **Flask (Machine Learning)**: 
   - Receives image and resizes it to 224x224.
   - Converts to numpy array and normalizes pixel values.
   - Passes image through the `model.pth` CNN (Convolutional Neural Network).
   - Generates confidence score and predicted class.
   - Determines severity and action plan / treatment.
5. **Flask -> Node.js**: Result JSON returned to Node.
6. **Node.js -> MongoDB**: Prediction is saved in MongoDB for historical tracking.
7. **Node.js -> React**: Final result is displayed natively in UI with colored severity tags.

## Installation & Running

This project runs as three separate services:
- `ml-model` (Flask + PyTorch inference)
- `backend` (Node.js + Express + MongoDB)
- `frontend` (Vite + React)

You can run everything from the root using the helper script, or start each service independently.

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ with `pip`
- MongoDB (local or remote URI)

### Environment Configuration
Each service supports `.env` files. Example files are provided in:
- `backend/.env.example`
- `frontend/.env.example`
- `ml-model/.env.example`

Copy the file to `.env` and update values before running.

### Run from root
```bash
npm install
npm run install:all
npm run dev
```

### Run with Docker Compose (recommended)
This repository includes a `docker-compose.yml` that builds and runs all services together.

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- ML inference: http://localhost:5000
- MongoDB: mongodb://localhost:27017

If you want to override service environment values, copy the example files:
- `backend/.env.example` → `backend/.env`
- `frontend/.env.example` → `frontend/.env`
- `ml-model/.env.example` → `ml-model/.env`

Then run:
```bash
docker compose up --build
```

To stop and remove containers:
```bash
docker compose down
```

If your Docker installation still uses the old CLI, replace `docker compose` with `docker-compose`.

### Redeploy after updates
When you change code or add a new model, rebuild and restart the containers:
```bash
docker compose up -d --build
```
If you want a full cleanup before redeploying, use:
```bash
docker compose down -v
docker compose up -d --build
```

### Start services individually

#### ML Model Service
```bash
cd ml-model
pip install -r requirements.txt
python app.py
```
- Default: `http://0.0.0.0:5000`
- Use `PORT`, `MODEL_PATH`, and `GEMINI_API_KEY` in `ml-model/.env`

#### Backend API
```bash
cd backend
npm install
npm run dev
```
- Default: `http://localhost:3000`
- Uses `backend/.env` values for `PORT`, `MONGO_URI`, `ML_API_URL`
- Defaults to local MongoDB at `mongodb://127.0.0.1:27017/crop-disease` if no `MONGO_URI` is set

#### Frontend React
```bash
cd frontend
npm install
npm run dev
```
- Default: `http://localhost:5173`
- Uses `VITE_API_URL` from `frontend/.env`

## How to Train Machine Learning Model
Inside `/ml-model/train.py`, there is a complete script utilizing Image Data Generators and CNN sequential logic.
1. Place the PlantVillage Dataset into `/ml-model/dataset/` under Folders (`Healthy`, `Early_Blight`, `Late_Blight`).
2. Run `python train.py`
3. A `model.pth` file will be generated and picked up by `/ml-model/app.py`.

## API Documentation

The Node.js backend (`http://localhost:3000`) exposes the following endpoints for the frontend:

### 1. `POST /api/predict`
Uploads an image for disease detection and returns the primary CNN diagnosis, and optionally an AI recommendation if confidence is low.

- **Required Fields**: 
  - `image` (Type: File): The leaf image file to be analyzed. Must be `.jpg`, `.jpeg`, or `.png`.

- **Request Example**: 
  `multipart/form-data` payload containing the `image` field.

- **Success Response (200 OK) Example**:
```json
{
  "disease": "Early Blight",
  "confidence": 92.5,
  "severity": "Severe",
  "treatment": "Remove affected lower leaves. Apply copper fungicide.",
  "top_predictions": [
    { "label": "Early Blight", "confidence": 92.5 },
    { "label": "Late Blight", "confidence": 7.5 }
  ],
  "source": "local_model"
}
```
*(If the CNN confidence is < 70%, the response will also include an `ai_recommendation` JSON object.)*

- **Error Responses**:
  - **400 Bad Request**: `{ "error": "Invalid file type. Only PNG, JPG, and JPEG are allowed." }`
  - **503 Service Unavailable**: `{ "error": "AI Inference Engine (Flask) is offline or unavailable." }`
  - **504 Gateway Timeout**: `{ "error": "AI Inference request timed out. Image may be too large or server is under heavy load." }`

### 2. `GET /api/history`
Retrieves a list of all past predictions saved in the MongoDB database.

- **Required Fields**: None.

- **Success Response (200 OK) Example**:
```json
[
  {
    "_id": "60a7d9f...",
    "imageUrl": "/uploads/leaf-1621588.jpg",
    "disease": "Early Blight",
    "confidence": 92.5,
    "severity": "Severe",
    "createdAt": "2023-10-25T14:32:00.000Z"
  }
]
```

- **Error Responses**:
  - **500 Internal Server Error**: `{ "error": "Failed to fetch history" }`
