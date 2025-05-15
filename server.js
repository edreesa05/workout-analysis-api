const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { extractVideoInfo, isValidSocialMediaUrl } = require('./videoExtractor');
const { analyzeWorkout } = require('./openAiService');

const app = express();

// Configure CORS with more specific options to allow all origins
app.use(cors({
  origin: '*',  // Allow requests from any origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: true,
  maxAge: 86400  // Cache preflight request for 24 hours
}));

// Enable JSON parsing with increased limit
app.use(express.json({ limit: '10mb' }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Workout Analysis API is running');
});

// Test endpoint for checking CORS
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working properly',
    headers: req.headers
  });
});

// API endpoint for workout video analysis
app.post('/api/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL is required' 
      });
    }
    
    // Validate URL format
    if (!isValidSocialMediaUrl(url)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid social media URL. Please provide a valid Instagram, TikTok, or YouTube URL.'
      });
    }
    
    console.log(`Processing analysis request for URL: ${url}`);
    
    // Extract video information
    const videoInfo = await extractVideoInfo(url);
    console.log('Video info extracted successfully');
    
    // Analyze the workout using OpenAI
    const analysis = await analyzeWorkout(videoInfo);
    console.log('OpenAI analysis completed successfully');
    
    // Return the analysis results
    res.json({
      success: true,
      ...analysis
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to analyze workout video'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
