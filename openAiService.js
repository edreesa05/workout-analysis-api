const { OpenAI } = require('openai');

// Initialize OpenAI with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// System prompt for workout analysis
const WORKOUT_ANALYSIS_PROMPT = `
You are a fitness expert analyzing workout videos from social media. 
Examine the provided video URL and details to identify:

1. Each exercise performed in the video
2. The type of each exercise (strength, cardio, flexibility, etc.)
3. Primary muscle groups targeted by each exercise
4. Estimated duration of each exercise in seconds
5. Difficulty level (beginner, intermediate, advanced)

Create a structured analysis with an array of workouts containing this information.
Even without seeing the actual video, make educated assumptions based on the URL 
and any metadata provided.

Format your response as a JSON object with this structure:
{
  "workouts": [
    {
      "name": "Exercise name",
      "type": "Exercise type",
      "muscleGroups": ["Primary muscle", "Secondary muscle"],
      "duration": 30,
      "difficulty": "beginner|intermediate|advanced",
      "confidence": 0.85
    }
  ],
  "videoTitle": "Estimated video title",
  "totalDuration": 120
}
`;

/**
 * Analyzes workout information from video metadata
 * In a full implementation, this would use actual video frames
 * This simplified version makes educated guesses based on URL and metadata
 */
async function analyzeWorkout(videoInfo) {
  try {
    console.log(`Analyzing workout for: ${videoInfo.url}`);
    
    // Create messages for OpenAI
    const messages = [
      { 
        role: "system", 
        content: WORKOUT_ANALYSIS_PROMPT 
      },
      {
        role: "user",
        content: `Analyze this workout video:
        URL: ${videoInfo.url}
        Platform: ${videoInfo.platform}
        Title: ${videoInfo.metadata.title}
        Creator: ${videoInfo.metadata.creator}
        Duration: ${videoInfo.metadata.duration}
        
        Based on this information, identify the likely exercises, targeted muscle groups, and other workout details.`
      }
    ];
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });
    
    // Parse and return the workout analysis
    const analysisText = response.choices[0].message.content;
    const analysis = JSON.parse(analysisText);
    
    return {
      workouts: analysis.workouts || [],
      videoUrl: videoInfo.url,
      videoTitle: analysis.videoTitle || videoInfo.metadata.title,
      thumbnailUrl: videoInfo.metadata.thumbnailUrl,
      platform: videoInfo.platform,
      creator: videoInfo.metadata.creator
    };
  } catch (error) {
    console.error('Error analyzing workout with OpenAI:', error);
    throw error;
  }
}

module.exports = { analyzeWorkout };
