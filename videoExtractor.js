/**
 * Simple video metadata extractor for social media URLs
 * Using a simplified approach without actual video downloads
 */
const axios = require('axios');

/**
 * Extracts metadata from a social media URL
 * Note: In a full implementation, this would actually download and process video frames
 * This simplified version just extracts information from the URL
 */
async function extractVideoInfo(videoURL) {
  try {
    console.log(`Processing video URL: ${videoURL}`);
    
    // Determine platform
    const platform = getPlatform(videoURL);
    
    // Generate a job ID
    const jobId = Date.now().toString();
    
    // In a real implementation, we would extract video frames here
    // For this simplified version, we'll just return metadata
    return {
      jobId,
      platform,
      url: videoURL,
      // This would normally come from actual processing
      metadata: {
        thumbnailUrl: 'https://via.placeholder.com/300x200?text=Workout+Video',
        title: `Workout Video (${platform})`,
        duration: '~2 minutes',
        creator: 'Fitness Creator'
      }
    };
  } catch (error) {
    console.error('Error extracting video info:', error);
    throw error;
  }
}

/**
 * Determines the platform from a video URL
 */
function getPlatform(url) {
  if (url.includes('instagram.com')) return 'Instagram';
  if (url.includes('tiktok.com')) return 'TikTok';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  return 'Unknown';
}

/**
 * Validates if a URL is for a supported social media platform
 */
function isValidSocialMediaUrl(url) {
  const instagramRegex = /instagram\.com\/(p|reel|tv)\/[^/]+/;
  const tiktokRegex = /tiktok\.com\/@[^/]+\/video\/\d+/;
  const youtubeRegex = /(youtube\.com\/watch\?v=|youtu\.be\/)[^&]+/;
  
  return instagramRegex.test(url) || tiktokRegex.test(url) || youtubeRegex.test(url);
}

module.exports = { 
  extractVideoInfo,
  isValidSocialMediaUrl
};
