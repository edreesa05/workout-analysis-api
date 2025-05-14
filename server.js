const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { extractVideoInfo, isValidSocialMediaUrl } = require('./videoExtractor');
const { analyzeWorkout } = require('./openAiService');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Workout Analysis API is running');
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
    
    // Extract video information
    const videoInfo = await extractVideoInfo(url);
    
    // Analyze the workout using OpenAI
    const analysis = await analyzeWorkout(videoInfo);
    
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
