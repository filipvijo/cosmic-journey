// --- Helper function for shuffling ---
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}
// --- ---

interface NasaImageItem {
  url: string;
  title: string;
}

module.exports = async (request: any, response: any) => { // Using any due to previous issues
  const { planet } = request.query;
  const apiKey = process.env.NASA_API_KEY;

  console.log(`NASA Images Fn: Checking NASA_API_KEY: ${apiKey ? 'Found' : 'Not Found!'}`);

  if (!planet || typeof planet !== 'string') {
    return response.status(400).json({ error: 'Planet query parameter is required.' });
  }
  if (!apiKey) {
    console.error('Serverless: NASA API key is not configured.');
    return response.status(500).json({ error: 'NASA API key configuration error.' });
  }

  const searchParams = new URLSearchParams({
    title: `${planet} surface`, // Keep specific title search
    media_type: 'image',
  });
  const NASA_SEARCH_URL = `https://images-api.nasa.gov/search?${searchParams.toString()}`;
  const MAX_IMAGES_TO_FETCH = 30; // Fetch more initially
  const MAX_IMAGES_TO_RETURN = 5; // How many to show

  console.log(`Serverless: Searching NASA Images for title "${planet} surface"`);

  try {
    const nasaResponse = await fetch(NASA_SEARCH_URL);

    if (!nasaResponse.ok) {
      const errorBody = await nasaResponse.text();
      console.error(`Serverless: NASA Image API Error for ${planet}: ${nasaResponse.status}`, errorBody);
      return response.status(nasaResponse.status).json({ error: `Failed to fetch images from NASA for ${planet}` });
    }

    const data = await nasaResponse.json();
    let items = data?.collection?.items;

    if (!items || items.length === 0) {
      console.log(`Serverless: No NASA image results found for ${planet}.`);
      return response.status(404).json({ error: `No NASA images found for ${planet}` });
    }

    // --- Shuffle and Select ---
    console.log(`Serverless: Found ${items.length} total NASA items for ${planet}. Shuffling and selecting ${MAX_IMAGES_TO_RETURN}.`);
    items = shuffleArray(items); // Shuffle the full list
    // --- ---

    // Extract data from the top N items of the *shuffled* list
    const images: NasaImageItem[] = items
      .slice(0, MAX_IMAGES_TO_FETCH) // Take a larger slice first
      .map((item: any) => {
        const imageUrl = item?.links?.[0]?.href;
        const title = item?.data?.[0]?.title;
        if (imageUrl && title) {
          return { url: imageUrl, title: title };
        }
        return null; // Exclude item if data is missing
      })
      .filter((image: NasaImageItem | null): image is NasaImageItem => image !== null)
      .slice(0, MAX_IMAGES_TO_RETURN); // Then take the final number needed

    console.log(`Serverless: Returning ${images.length} NASA images for ${planet}.`);
    response.status(200).json({ images });

  } catch (error: any) {
    console.error(`Serverless: Error fetching NASA images for ${planet}:`, error);
    response.status(500).json({ error: `Internal Server Error fetching NASA images: ${error.message}` });
  }
};
