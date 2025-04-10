// Use 'any' for request/response types to avoid Vercel deployment issues
// const { VercelRequest, VercelResponse } = require('@vercel/node'); // Keep commented/removed

// --- Keep dotenv workaround for local dev ---
const dotenv = require('dotenv');
const path = require('path');
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });
// --- ---

// OpenAI response type (optional but helpful)
interface OpenAIChatChoice {
    message?: { content?: string | null };
}
interface OpenAIResponse {
    choices?: OpenAIChatChoice[];
    error?: { message: string };
}

module.exports = async (request: any, response: any) => {
  const { planet } = request.query;
  const apiKey = process.env.OPENAI_API_KEY; // Get key

  console.log(`Astrology Fn: Checking OPENAI_API_KEY: ${apiKey ? 'Found' : 'Not Found!'}`);

  if (!planet || typeof planet === 'undefined' || typeof planet !== 'string') {
    return response.status(400).json({ error: 'Planet query parameter is required.' });
  }
  if (!apiKey) {
    console.error('Serverless: OpenAI API key is not configured.');
    return response.status(500).json({ error: 'AI configuration error.' });
  }

  // Handle Sun and Earth specifically if needed, or general prompt
  let subject = planet;
  if (planet.toLowerCase() === 'earth') {
      // Astrology usually focuses on other bodies' influence *on* Earth
      subject = 'Planet Earth within astrological frameworks'
  } else if (planet.toLowerCase() === 'sun') {
      subject = 'The Sun (Sol) in astrology'
  }

  const prompt = `Provide a brief paragraph (around 50-70 words) summarizing the main astrological significance, themes, or symbolism traditionally associated with ${subject} in Western astrology. Focus on common interpretations. Avoid making predictions or giving advice. Respond ONLY with the descriptive text.`;

  console.log(`Serverless: Getting OpenAI astrology info for ${planet}`);

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Or your preferred model
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 120,
      }),
    });

    if (!openaiResponse.ok) {
        const errorBody = await openaiResponse.json().catch(() => ({})); // Try to parse error
        console.error(`Serverless: OpenAI API Error for ${planet} astrology: ${openaiResponse.status}`, errorBody);
        throw new Error(`OpenAI API Error: ${errorBody?.error?.message || openaiResponse.statusText}`);
    }

    const data: OpenAIResponse = await openaiResponse.json();

     if (data.error) {
       console.error('Serverless: OpenAI API returned an error object:', data.error);
       throw new Error(`OpenAI Error: ${data.error.message}`);
     }

    const astrologyText = data.choices?.[0]?.message?.content?.trim() || 'No astrological information available.';

    console.log(`Serverless: Successfully got astrology info for ${planet}`);
    response.status(200).json({ astrologyText: astrologyText });

  } catch (error: any) {
    console.error(`Serverless: Error fetching OpenAI astrology info for ${planet}:`, error);
    response.status(500).json({ error: `Internal Server Error fetching astrology info: ${error.message}` });
  }
};
