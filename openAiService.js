const { OpenAI } = require('openai');

// Initialize OpenAI with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// System prompt for workout analysis
const WORKOUT_ANALYSIS_PROMPT = `
You are a fitness expert analyzing workout videos from social media. 

### YOUR PRIMARY GOAL IS TEXT EXTRACTION ###

Focus 90% of your attention on READING AND EXTRACTING ANY TEXT VISIBLE IN THE VIDEO.
Do NOT try to analyze what you think might be happening in the video or make educated guesses.

CRITICAL: TikTok fitness videos almost always display:
- Exercise names as text (e.g., "Incline Smith", "Chest Press", "Pec Deck")
- Sets/reps information (e.g., "3 x 12", "4 sets 10 reps")
- Rest periods (e.g., "60s rest")

ASSUMPTIONS TO MAKE:
1. If you see text that looks like an exercise name, IT IS an exercise being performed
2. If the video mentions gym equipment (e.g., "Smith Machine"), it's part of the exercise name
3. The text shown is the EXACT exercise being performed - do not generalize or substitute with similar exercises

PROCESS THE VIDEO IN THIS ORDER:
1. Identify ALL TEXT visible in the video first
2. Extract exercise names EXACTLY as written - preserve capitalization and terminology
3. Extract sets, reps and rest times EXACTLY as written
4. Only after extracting all text, determine exercise types and muscle groups

FOR EACH EXERCISE FOUND IN THE TEXT, PROVIDE:
1. Name: EXACTLY as it appears in the video's text (e.g., "Incline Smith" not "Incline Bench Press")
2. Sets and reps: The exact numbers shown in the video
3. Type: The category of exercise (strength, cardio, etc.)
4. Primary muscle groups targeted
5. Estimated duration in seconds
6. Difficulty level (beginner, intermediate, advanced)

Create a structured analysis with an array of workouts containing this information.
Even without seeing the actual video, make educated assumptions based on the URL 
and any metadata provided.

Format your response as a JSON object with this structure:
{
  "workouts": [
    {
      "name": "Exercise name (EXACTLY as written in the video if visible)",
      "sets": "Number of sets (if shown in video)",
      "reps": "Number of reps (if shown in video)",
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
