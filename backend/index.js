const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const dns = require('dns');

// Override local DNS to prevent blocks
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI =
 process.env.MONGO_URI ||
 'mongodb://127.0.0.1:27017/crop-disease';

const flaskApiUrl =
 process.env.ML_API_URL ||
 'http://127.0.0.1:5000';

console.log('Starting backend with configuration:');
console.log('  PORT =', process.env.PORT || 3000);
console.log('  MONGO_URI =', mongoURI.replace(/(mongodb\+srv:\/\/).*@/, '$1***@'));
console.log('  ML_API_URL =', flaskApiUrl);

const historySchema = new mongoose.Schema({
  disease: String,
  confidence: Number,
  severity: String,
  treatment: String,
  imageUrl: String,
  timestamp: { type: Date, default: Date.now }
});
const RealHistory = mongoose.model('History', historySchema);

// In-memory fallback if MongoDB fails
const mockHistoryArray = [];
class MockHistory {
  constructor(data) {
    Object.assign(this, data);
    this.timestamp = new Date();
    this._id = Math.random().toString();
  }
  async save() {
    mockHistoryArray.push(this);
  }
  static find() {
    return {
      sort: () => ({
        limit: () => [...mockHistoryArray].reverse().slice(0, 20)
      })
    };
  }
}

let HistoryModel = MockHistory;

mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 4000 })
  .then(() => {
    console.log('MongoDB connected successfully.');
    HistoryModel = RealHistory;
  })
  .catch(err => {
    console.log('MongoDB connection failed. Using mock memory database.');
  });

const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/predict', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = path.resolve(req.file.path);
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    const flaskResponse = await axios.post(`${flaskApiUrl}/infer`, formData, {
      headers: formData.getHeaders(),
      timeout: 15000 // 15-second timeout
    });

    const result = flaskResponse.data;

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    console.log('Saving prediction with image URL:', imageUrl);

    const newPrediction = new HistoryModel({
      disease: result.disease,
      confidence: result.confidence,
      severity: result.severity,
      treatment: result.treatment,
      imageUrl: imageUrl
    });

    await newPrediction.save();
    
    res.json({
      _id: newPrediction._id,
      disease: newPrediction.disease,
      confidence: newPrediction.confidence,
      severity: newPrediction.severity,
      treatment: newPrediction.treatment,
      imageUrl: newPrediction.imageUrl,
      timestamp: newPrediction.timestamp,
      ai_recommendation: result.ai_recommendation,
      source: result.source
    });

  } catch (error) {
    console.error("Prediction error:", error.message);
    if (error.response) {
      // Flask returned an error status (e.g., 400 Invalid Upload)
      return res.status(error.response.status).json({ error: error.response.data.error || 'Server error during inference.' });
    } else if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'AI Inference Engine (Flask) is offline or unavailable.' });
    } else if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'AI Inference request timed out. Image may be too large or server is under heavy load.' });
    } else {
      return res.status(500).json({ error: 'An unexpected internal backend error occurred.' });
    }
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const historyData = await HistoryModel.find().sort({ timestamp: -1 }).limit(20);
    res.json(historyData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
