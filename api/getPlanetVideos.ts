const { VercelRequest, VercelResponse } = require('@vercel/node');

interface YouTubeVideoItem {
    videoId: string;
    title: string;
    thumbnailUrl: string;
}

module.exports = async (request, response) => {
  const { planet } = request.query;
  const apiKey = process.env.YOUTUBE_API_KEY;

  console.log(`YouTube Fn: Checking YOUTUBE_API_KEY: ${apiKey ? 'Found' : 'Not Found!'}`);

  if (!planet || typeof planet !== 'string') {
    return response.status(400).json({ error: 'Planet query parameter is required.' });
  }
  if (!apiKey) {
    console.error('Serverless: YouTube API key is not configured.');
    return response.status(500).json({ error: 'YouTube API key configuration error.' });
  }

  // Construct Youtube URL
  const query = `${planet} planet documentary space`; // Search query
  const maxResults = 5; // Number of videos to fetch
  const searchParams = new URLSearchParams({
      part: 'snippet', // Required part parameter
      q: query,
      type: 'video', // Search only for videos
      maxResults: maxResults.toString(),
      key: apiKey, // API Key
  });
  const Youtube_URL = `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`;

  console.log(`Serverless: Searching YouTube for "${query}"`);

  try {
    const youtubeResponse = await fetch(Youtube_URL);

    if (!youtubeResponse.ok) {
      const errorBody = await youtubeResponse.json(); // YouTube errors are usually JSON
      console.error(`Serverless: YouTube API Error for ${planet}: ${youtubeResponse.status}`, errorBody);
      return response.status(youtubeResponse.status).json({ error: `Failed to fetch videos from YouTube: ${errorBody?.error?.message || 'Unknown error'}` });
    }

    const data = await youtubeResponse.json();
    const items = data?.items;

    if (!items || items.length === 0) {
      console.log(`Serverless: No YouTube video results found for ${query}.`);
      // Return empty array instead of 404 - finding no videos isn't strictly an error
      return response.status(200).json({ videos: [] });
    }

    // Extract relevant data (videoId, title, thumbnail)
    const videos: YouTubeVideoItem[] = items
      .map((item: any) => {
          const videoId = item?.id?.videoId;
          const title = item?.snippet?.title;
          // Get medium or default thumbnail
          const thumbnailUrl = item?.snippet?.thumbnails?.medium?.url || item?.snippet?.thumbnails?.default?.url;
          if (videoId && title && thumbnailUrl) {
              return { videoId, title, thumbnailUrl };
          }
          return null;
      })
      .filter((video: YouTubeVideoItem | null): video is YouTubeVideoItem => video !== null);

    console.log(`Serverless: Found ${videos.length} YouTube videos for ${query}.`);
    response.status(200).json({ videos }); // Return array of video objects

  } catch (error: any) {
    console.error(`Serverless: Error fetching YouTube videos for ${planet}:`, error);
    response.status(500).json({ error: `Internal Server Error fetching YouTube videos: ${error.message}` });
  }
};
