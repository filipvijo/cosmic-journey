import type { VercelRequest, VercelResponse } from '@vercel/node';

// Log AFTER attempting manual load
console.log("--- All Environment Variables (After Manual dotenv Load) ---", process.env);

// Add these interfaces near the top
interface OpenAIChatChoice {
  message?: {
    content?: string | null;
  } | null;
}

interface OpenAIChatResponse {
  choices?: OpenAIChatChoice[] | null;
  error?: { message: string; type: string }; // Include error field potentially
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Add specific log here too
  console.log("Value of OPENAI_API_KEY inside handler:", process.env.OPENAI_API_KEY);

  const { planet } = request.query;
  // This line should now hopefully find the key
  const apiKey = process.env.OPENAI_API_KEY;

  if (!planet || typeof planet !== 'string') {
    return response.status(400).json({ error: 'Planet query parameter is required.' });
  }
  if (!apiKey) {
    console.error('Serverless: OpenAI API key still not configured, even after manual load attempt.');
    return response.status(500).json({ error: 'AI configuration error.' });
  }

  const prompt = `Write a concise and engaging paragraph (around 50-70 words) describing the planet ${planet}, suitable for a general audience exploring a solar system app. Focus on its key characteristics or notable features.`;

  console.log(`Serverless: Getting OpenAI description for ${planet}`);

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Use the desired model ID
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7, // Adjust creativity
        max_tokens: 100, // Limit response length
      }),
    });

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text();
      console.error(`Serverless: OpenAI API Error for ${planet}: ${openaiResponse.status} ${openaiResponse.statusText}`, errorBody);
      return response.status(openaiResponse.status).json({ error: `Failed to get description from AI for ${planet}` });
    }

    const data: OpenAIChatResponse = await openaiResponse.json();

    // Check for OpenAI API error object before accessing choices
    if (data.error) {
      console.error('Serverless: OpenAI API returned an error:', data.error.message);
      // Return an appropriate error response to the frontend
      return response.status(500).json({ error: `AI Error: ${data.error.message}` });
    }

    // Proceed with extracting description if no error field exists
    const description = data.choices?.[0]?.message?.content?.trim() || 'No description available.';

    console.log(`Serverless: Successfully got description for ${planet}`);
    response.status(200).json({ description });

  } catch (error) {
    console.error(`Serverless: Error fetching OpenAI description for ${planet}:`, error);
    response.status(500).json({ error: 'Internal Server Error fetching description' });
  }
}
