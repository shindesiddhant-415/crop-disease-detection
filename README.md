# Smart Crop Disease Detection System

A SY project for MIT Academy of Engineering, School of Computer Engineering.

This is a complete MERN-like stack (React, Node.js, MongoDB) integrated with a Python Machine Learning component (Flask + PyTorch MobileNetV2 Transfer Learning CNN) that analyzes crop leaf images and detects diseases with treatment recommendations.

## 🌐 Live Demo

**Deployed Application:**
https://crop-frontend-production.up.railway.app/

## 🚀 Features

* Upload crop leaf images for disease detection
* Deep Learning model using MobileNetV2 Transfer Learning
* Confidence score and disease prediction
* Severity analysis and treatment recommendations
* MongoDB prediction history tracking
* Responsive React frontend
* REST API architecture
* Docker support for deployment

---

# Architecture & Workflow

1. **User (Farmer) Uploads Image** using the React UI.
2. **React → Node.js Backend** sends image through FormData to `/api/predict`.
3. **Node.js → Flask ML Service** forwards the image for inference.
4. **Flask Model Processing**

   * Resizes image to 224×224
   * Converts image to NumPy array
   * Normalizes pixel values
   * Runs inference using MobileNetV2 CNN
   * Generates confidence score and disease prediction
   * Determines severity level and treatment plan
5. **Flask → Node.js** returns prediction JSON.
6. **Node.js → MongoDB** stores prediction history.
7. **Node.js → React** displays results with severity indicators.

---

# Tech Stack

### Frontend

* React.js
* Vite
* Axios
* CSS

### Backend

* Node.js
* Express.js
* Multer

### Database

* MongoDB

### Machine Learning

* Python
* Flask
* PyTorch
* MobileNetV2

### Deployment

* Railway
* Docker

---

# Project Structure

```text
Smart-Crop-Disease-Detection/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── uploads/
│   └── package.json
│
├── ml-model/
│   ├── app.py
│   ├── train.py
│   ├── model.pth
│   └── requirements.txt
│
├── docker-compose.yml
└── README.md
```

---

# Installation & Running

The project consists of three services:

* Frontend (React)
* Backend (Node.js + Express)
* Machine Learning Service (Flask + PyTorch)

## Prerequisites

* Node.js 18+
* Python 3.10+
* MongoDB
* Docker (optional)

---

# Environment Configuration

Each service supports `.env` files.

### Backend

```env
PORT=3000
MONGO_URI=your_mongodb_uri
ML_API_URL=http://localhost:5000
```

### Frontend

```env
VITE_API_URL=http://localhost:3000
```

### ML Model

```env
PORT=5000
MODEL_PATH=model.pth
GEMINI_API_KEY=your_api_key
```

---

# Run from Root

```bash
npm install
npm run install:all
npm run dev
```

---

# Docker Deployment

Build and run all services:

```bash
docker compose up --build
```

Stop containers:

```bash
docker compose down
```

Rebuild after updates:

```bash
docker compose up -d --build
```

Full cleanup:

```bash
docker compose down -v
docker compose up -d --build
```

---

# Run Services Individually

## ML Service

```bash
cd ml-model
pip install -r requirements.txt
python app.py
```

Default URL:

```text
http://localhost:5000
```

---

## Backend

```bash
cd backend
npm install
npm run dev
```

Default URL:

```text
http://localhost:3000
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Default URL:

```text
http://localhost:5173
```

---

# Model Training

1. Download the PlantVillage Dataset.
2. Place dataset inside:

```text
ml-model/dataset/
```

Dataset Structure:

```text
dataset/
├── Healthy/
├── Early_Blight/
└── Late_Blight/
```

3. Train the model:

```bash
python train.py
```

4. A trained model file (`model.pth`) will be generated automatically.

---

# API Documentation

## POST /api/predict

Uploads a leaf image and returns disease prediction.

### Request

```multipart/form-data
image: File
```

### Success Response

```json
{
  "disease": "Early Blight",
  "confidence": 92.5,
  "severity": "Severe",
  "treatment": "Remove affected lower leaves. Apply copper fungicide.",
  "source": "local_model"
}
```

### Error Responses

```json
{
  "error": "Invalid file type"
}
```

```json
{
  "error": "AI Inference Engine unavailable"
}
```

---

## GET /api/history

Returns previous predictions stored in MongoDB.

### Success Response

```json
[
  {
    "_id": "123456",
    "disease": "Early Blight",
    "confidence": 92.5,
    "severity": "Severe"
  }
]
```

---

# Future Enhancements

* Multi-crop disease support
* Real-time camera detection
* Weather-based disease prediction
* Farmer dashboard analytics
* Mobile application support
* Multilingual recommendations

---

# Author

**Siddhant Balaso Shinde**

* GitHub: https://github.com/shindesiddhant-415
* LinkedIn: https://www.linkedin.com/in/siddhant-shinde-36b621377/
* Email: [shindesiddhant415@gmail.com](mailto:shindesiddhant415@gmail.com)

---

# License

This project is developed for educational and academic purposes at MIT Academy of Engineering.
