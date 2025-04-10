// api/getNasaImages.ts (or .cts)

// Use 'any' for request/response types to avoid Vercel deployment issues
// const { VercelRequest, VercelResponse } = require('@vercel/node'); // Keep commented/removed

const { VercelRequest, VercelResponse } = require('@vercel/node'); // Use require for CJS

// --- Helper function for shuffling ---
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}
// --- ---

interface NasaImageItem { url: string; title: string; }

module.exports = async (request: any, response: any) => {
  const { planet } = request.query;
  const apiKey = process.env.NASA_API_KEY;

  console.log(`NASA Images Fn: Checking NASA_API_KEY: ${apiKey ? 'Found' : 'Not Found!'}`);

  if (!planet || typeof planet === 'undefined' || typeof planet !== 'string') {
    return response.status(400).json({ error: 'Planet query parameter is required.' });
  }
  if (!apiKey) {
    console.error('Serverless: NASA API key is not configured.');
    return response.status(500).json({ error: 'NASA API key configuration error.' });
  }

  // Construct search URL (searching title for relevance)
  const searchParams = new URLSearchParams({
      title: `${planet}`, // Keep search simpler? Or add keywords back? Let's start simple.
      // q: `${planet} planet surface`, // Alternative search
      media_type: 'image',
      // Add api_key if needed for this endpoint, check NASA docs
      // api_key: apiKey
  });
  // Vercel automatically limits results, but we fetch default (usually 100) and filter/shuffle
  const NASA_SEARCH_URL = `https://images-api.nasa.gov/search?${searchParams.toString()}`;


  console.log(`Serverless: Searching NASA Images for title "${planet}"`);

  try {
    const nasaResponse = await fetch(NASA_SEARCH_URL /*, { headers: ... if key needed here}*/);

    if (!nasaResponse.ok) {
      const errorBody = await nasaResponse.text().catch(()=>'{}'); // Get text if not json
      console.error(`Serverless: NASA Image API Error for ${planet}: ${nasaResponse.status}`, errorBody);
      return response.status(nasaResponse.status).json({ error: `Failed to fetch images from NASA for ${planet}` });
    }

    const data = await nasaResponse.json();
    const items = data?.collection?.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log(`Serverless: No NASA image results found for ${planet}.`);
      return response.status(404).json({ error: `No NASA images found for ${planet}` });
    }
    console.log(`Serverless: Found ${items.length} initial NASA items for ${planet}. Filtering...`);

    // --- Filter Results ---
    const positiveKeywords = ['surface', 'planet', 'landscape', 'orbiter', 'rover', 'color photo', 'mosaic', 'crater', 'atmosphere', 'clouds', 'rings', 'hst', 'hubble', 'jwst', 'webb', planet.toLowerCase()];
    const negativeKeywords = ['illustration', 'artist', 'concept', 'impression', 'diagram', 'chart', 'model', 'event', 'group photo', 'training', 'logo', 'insignia', 'poster', 'earth observation', 'launch', 'conference', 'astronaut suit', 'sample return'];

    let filteredItems = items.filter((item: any) => {
        const title = item?.data?.[0]?.title?.toLowerCase() || '';
        const desc = item?.data?.[0]?.description?.toLowerCase() || '';
        const text = title + ' ' + desc;

        // Basic checks first
        if (!item?.links?.[0]?.href || !title) return false; // Must have image url and title
        if (!item.links[0].href.match(/\.(jpg|jpeg|png)$/i)) return false; // Ensure it links to an image file

        const hasPositive = positiveKeywords.some(kw => text.includes(kw));
        const hasNegative = negativeKeywords.some(kw => text.includes(kw));

        return hasPositive && !hasNegative; // Keep if positive keyword found AND no negative keywords found
    });
    console.log(`Serverless: Found ${filteredItems.length} relevant items after filtering.`);
    // --- End Filter ---

    if (filteredItems.length === 0) {
       console.log(`Serverless: No relevant NASA images found for ${planet} after filtering.`);
       return response.status(404).json({ error: `No relevant NASA images found for ${planet}` });
    }

    // --- Shuffle and Select ---
    const MAX_IMAGES_TO_RETURN = 5;
    filteredItems = shuffleArray(filteredItems); // Shuffle the relevant ones
    // --- ---

    // Extract data from the top N items
    const images: NasaImageItem[] = filteredItems
      .slice(0, MAX_IMAGES_TO_RETURN) // Take the final number needed
      .map((item: any) => ({
          url: item.links[0].href,
          title: item.data[0].title
       }));

    console.log(`Serverless: Returning ${images.length} NASA images for ${planet}.`);
    response.status(200).json({ images }); // Return the array of relevant images

  } catch (error: any) {
    console.error(`Serverless: Error processing NASA images for ${planet}:`, error);
    response.status(500).json({ error: `Internal Server Error processing NASA images: ${error.message}` });
  }
};
