const { VercelRequest, VercelResponse } = require('@vercel/node');

interface NasaImageItem {
    url: string;
    title: string;
}

module.exports = async (request, response) => {
  const { planet } = request.query;
  const apiKey = process.env.NASA_API_KEY; // Get NASA key

  console.log(`NASA Images Fn: Checking NASA_API_KEY: ${apiKey ? 'Found' : 'Not Found!'}`);

  if (!planet || typeof planet !== 'string') {
    return response.status(400).json({ error: 'Planet query parameter is required.' });
  }
  if (!apiKey) {
    console.error('Serverless: NASA API key is not configured.');
    return response.status(500).json({ error: 'NASA API key configuration error.' });
  }

  // Construct the NASA Image Library search URL
  const searchParams = new URLSearchParams({
      // REMOVE the 'q' parameter:
      // q: `${planet} planet surface landscape rover orbiter`,

      // ADD a 'title' parameter instead:
      title: `${planet} surface`, // Search for "Mars surface" etc. in the image TITLE

      media_type: 'image', // Still want only images
  });
  const NASA_SEARCH_URL = `https://images-api.nasa.gov/search?${searchParams.toString()}`;

  console.log(`Serverless: Searching NASA Images for title "${planet} surface"`);

  try {
    const nasaResponse = await fetch(NASA_SEARCH_URL, {
       headers: {
         // Some NASA APIs might prefer key in header, double check docs if query param doesn't work
         // 'X-Api-Key': apiKey
       }
    });

    if (!nasaResponse.ok) {
      const errorBody = await nasaResponse.text();
      console.error(`Serverless: NASA Image API Error for ${planet}: ${nasaResponse.status}`, errorBody);
      return response.status(nasaResponse.status).json({ error: `Failed to fetch images from NASA for ${planet}` });
    }

    const data = await nasaResponse.json();
    const items = data?.collection?.items;

    if (!items || items.length === 0) {
      console.log(`Serverless: No NASA image results found for ${planet}.`);
      return response.status(404).json({ error: `No NASA images found for ${planet}` });
    }

    // Extract relevant data (URL and Title) for the first few items (e.g., max 5)
    const images: NasaImageItem[] = items
      .slice(0, 5) // Limit to 5 images
      .map((item: any) => {
          // Ensure item structure is as expected before accessing properties
          const imageUrl = item?.links?.[0]?.href;
          const title = item?.data?.[0]?.title;
          // Only return if we have both URL and title
          if (imageUrl && title) {
              return { url: imageUrl, title: title };
          }
          return null; // Exclude item if data is missing
      })
      .filter((image: NasaImageItem | null): image is NasaImageItem => image !== null); // Filter out null entries


    console.log(`Serverless: Found ${images.length} NASA images for ${planet}.`);
    response.status(200).json({ images }); // Return the array of images

  } catch (error: any) {
    console.error(`Serverless: Error fetching NASA images for ${planet}:`, error);
    response.status(500).json({ error: `Internal Server Error fetching NASA images: ${error.message}` });
  }
};
