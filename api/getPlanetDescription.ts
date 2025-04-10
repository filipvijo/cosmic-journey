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

module.exports = async (request: any, response: any) => { // Use any for request and response
  const { planet } = request.query;
  const apiKey = process.env.OPENAI_API_KEY;

  console.log("Value of OPENAI_API_KEY inside handler:", apiKey);

  if (!planet || typeof planet !== 'string') {
    return response.status(400).json({ error: 'Planet query parameter is required.' });
  }
  if (!apiKey) {
    console.error('Serverless: OpenAI API key is not configured.');
    return response.status(500).json({ error: 'AI configuration error.' });
  }

  // --- Modify the Prompt ---
  const openAIPrompt = `Write two concise and engaging paragraphs describing the planet ${planet} (total around 100-120 words), suitable for a general audience exploring a solar system app. Focus on its key characteristics or notable features based on general scientific understanding (e.g., ${planet === 'Mars' ? 'Mars\' thin atmosphere, cold temperatures, reddish appearance, volcanoes, and potential subsurface water' : planet === 'Jupiter' ? 'Jupiter\'s massive size, gas giant nature, Great Red Spot, radiation belts, and numerous moons' : planet === 'Sun' ? 'the Sun\'s nature as a star, its plasma composition, immense heat, fusion process, and solar activity (keep it slightly sci-fi)' : 'its known conditions'}). Conclude the entire response with a fascinating 'Did you know...' sentence relevant to ${planet}. Respond ONLY with the description text, nothing else before or after.`;
  // --- End Prompt Modification ---

  console.log(`Serverless: Getting OpenAI description for ${planet}`);

  try {
    // Use require for node-fetch if still needed, otherwise assume native fetch

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: openAIPrompt }],
        temperature: 0.8, // Keep temperature slightly high for variation
        max_tokens: 200, // Increased slightly for longer response + fact
      }),
    });

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text();
      console.error(`Serverless: OpenAI API Error for ${planet}: ${openaiResponse.status}`, errorBody);
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

  } catch (error: any) {
    console.error(`Serverless: Error fetching OpenAI description for ${planet}:`, error);
    response.status(500).json({ error: 'Internal Server Error fetching description' });
  }
};
