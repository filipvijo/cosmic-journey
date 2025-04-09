// --- Helper function for shuffling ---
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}
// --- ---

interface YouTubeVideoItem {
  videoId: string;
  title: string;
  thumbnailUrl: string;
}

module.exports = async (request: any, response: any) => { // Using any
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

  // Refine query slightly
  const query = `${planet} planet documentary science NASA JPL`; // Added NASA, JPL
  const MAX_RESULTS_TO_FETCH = 25; // Ask YouTube for more results
  const MAX_RESULTS_TO_RETURN = 5; // How many to show

  const searchParams = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: MAX_RESULTS_TO_FETCH.toString(), // Fetch more
    key: apiKey,
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
    let items = data?.items;

    if (!items || items.length === 0) {
      console.log(`Serverless: No YouTube video results found for ${query}.`);
      return response.status(200).json({ videos: [] });
    }

    // --- Shuffle and Select ---
    console.log(`Serverless: Found ${items.length} total YouTube items for ${query}. Shuffling and selecting ${MAX_RESULTS_TO_RETURN}.`);
    items = shuffleArray(items); // Shuffle the list
    // --- ---

    // Extract data from the top N items of the *shuffled* list
    const videos: YouTubeVideoItem[] = items
      .map((item: any) => {
        const videoId = item?.id?.videoId;
        const title = item?.snippet?.title;
        const thumbnailUrl = item?.snippet?.thumbnails?.medium?.url || item?.snippet?.thumbnails?.default?.url;
        if (videoId && title && thumbnailUrl) {
          return { videoId, title, thumbnailUrl };
        }
        return null; // Exclude item if data is missing
      })
      .filter((video: YouTubeVideoItem | null): video is YouTubeVideoItem => video !== null)
      .slice(0, MAX_RESULTS_TO_RETURN); // Take the final number needed

    console.log(`Serverless: Returning ${videos.length} YouTube videos for ${query}.`);
    response.status(200).json({ videos });

  } catch (error: any) {
    console.error(`Serverless: Error fetching YouTube videos for ${planet}:`, error);
    response.status(500).json({ error: `Internal Server Error fetching YouTube videos: ${error.message}` });
  }
};
