import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const { planet } = request.query;

  if (!planet || typeof planet !== 'string') {
    return response.status(400).json({ error: 'Planet query parameter is required.' });
  }

  // Convert planet name for API (e.g., "Earth" -> "earth") - API might be case-sensitive
  const planetApiName = planet.toLowerCase();

  // Use the real API URL
  const EXTERNAL_API_URL = `https://api.le-systeme-solaire.net/rest/bodies/${planetApiName}`;

  console.log(`Serverless: Fetching data for ${planet} from ${EXTERNAL_API_URL}`);

  try {
    // Make the request to the external API
    const apiResponse = await fetch(EXTERNAL_API_URL);

    if (!apiResponse.ok) {
      // Handle case where the planet isn't found in the external API
      if (apiResponse.status === 404) {
        console.log(`Serverless: Planet ${planet} not found in external API.`);
        return response.status(404).json({ error: `Data not found for ${planet}` });
      }
      // Forward other errors
      console.error(`Serverless: API Error for ${planet}: ${apiResponse.status} ${apiResponse.statusText}`);
      return response.status(apiResponse.status).json({ error: `Failed to fetch data from external API for ${planet}` });
    }

    const data = await apiResponse.json();
    console.log(`Serverless: Successfully fetched data for ${planet}`);

    // Send the successful response back to your frontend
    response.status(200).json(data);

  } catch (error) {
    console.error(`Serverless: Error in function for ${planet}:`, error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
}
