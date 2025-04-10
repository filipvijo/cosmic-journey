// api/getApod.cts
// Using 'any' for req/res types due to previous deployment issues
// const { VercelRequest, VercelResponse } = require('@vercel/node');

// Use dynamic import or require for node-fetch if needed, or assume native fetch
const fetch = (...args: any[]) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Keep dotenv workaround for local dev
const dotenv = require('dotenv');
const path = require('path');
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

module.exports = async (request: any, response: any) => {
  const apiKey = process.env.NASA_API_KEY; // Use the same NASA key

  console.log(`APOD Fn: Checking NASA_API_KEY: ${apiKey ? 'Found' : 'Not Found!'}`);

  if (!apiKey) {
    console.error('Serverless: NASA API key is not configured for APOD.');
    // Return 500 only if key is mandatory, NASA might work with DEMO_KEY default
    return response.status(500).json({ error: 'NASA API key configuration error.' });
  }

  const NASA_APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

  console.log(`Serverless: Fetching APOD from ${NASA_APOD_URL}`);

  try {
    const apodResponse = await fetch(NASA_APOD_URL);

    if (!apodResponse.ok) {
      const errorBody = await apodResponse.json().catch(() => ({}));
      console.error(`Serverless: NASA APOD API Error: ${apodResponse.status}`, errorBody);
      throw new Error(`NASA APOD API Error: ${errorBody?.msg || apodResponse.statusText}`);
    }

    const data = await apodResponse.json();

    console.log(`Serverless: Successfully fetched APOD data for date ${data.date}.`);

    // Return the relevant fields
    response.status(200).json({
        title: data.title,
        explanation: data.explanation,
        date: data.date,
        url: data.url,
        hdurl: data.hdurl, // High-definition URL (might not always exist)
        media_type: data.media_type, // Important: "image" or "video"
        copyright: data.copyright // Optional copyright info
     });

  } catch (error: any) {
    console.error(`Serverless: Error fetching APOD:`, error);
    response.status(500).json({ error: `Internal Server Error fetching APOD: ${error.message}` });
  }
};
