import dotenv from 'dotenv';
import path from 'path'; // Make sure path is imported too

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const { fal } = require('@fal-ai/client'); // Uncommented and using require

// --- Interfaces ---
interface SpeciesInfo {
    category: 'Micro-organism' | 'Animal' | 'Humanoid';
    name: string;
    description: string;
    imageUrl?: string | null; // To be added after Fal.ai call
}

interface OpenAIChatChoice {
    message?: { content?: string | null };
}
interface OpenAIResponse {
    choices?: OpenAIChatChoice[];
    error?: { message: string };
}

interface FalSubscribeInput {
    prompt: string;
    image_size?: string | { width: number; height: number };
}
// --- ---

module.exports = async (request: any, response: any) => { // Use any for request and response
  const { planet } = request.query;
  const openAIApiKey = process.env.OPENAI_API_KEY;
  const falApiKey = process.env.FAL_KEY;

  console.log(`Generate Species Fn: Checking Keys - OpenAI: ${openAIApiKey ? 'OK' : 'MISSING!'}, Fal: ${falApiKey ? 'OK' : 'MISSING!'}`);

  if (!planet || typeof planet !== 'string') {
    return response.status(400).json({ error: 'Planet query parameter is required.' });
  }
  if (!openAIApiKey || !falApiKey) {
    console.error('Serverless: OpenAI or Fal.ai API key is not configured.');
    return response.status(500).json({ error: 'AI configuration error (Missing Keys).' });
  }

  // --- Create prompts based on planet type ---
  const planetNameLower = planet.toLowerCase();
  let habitablePromptPrefix = "";

  if (["mercury", "venus", "mars"].includes(planetNameLower)) { // Add mercury and venus to extreme condition planets
      // For extreme condition planets
      habitablePromptPrefix = `Imagine that in a protected environment or special evolutionary conditions on ${planet}, life has evolved to survive the extreme conditions. `;
  } else if (["jupiter", "saturn"].includes(planetNameLower)) {
      // For gas giants
      habitablePromptPrefix = `Imagine that in the upper atmosphere of ${planet}, life has evolved to survive the gaseous environment. `;
  } else if (["uranus", "neptune"].includes(planetNameLower)) {
      // For ice giants
      habitablePromptPrefix = `Imagine that in the outer atmospheric layers of ${planet}, in regions with more moderate temperatures and pressures, unique life has evolved. `;
  }

  // --- 1. Call OpenAI for Species Descriptions ---
  console.log(`Serverless: Requesting species descriptions for ${planet} from OpenAI...`);
  let speciesList: SpeciesInfo[] = [];
  try {
    const openAIPrompt = `${habitablePromptPrefix}Invent exactly three distinct hypothetical species that *might* evolve there:
    1. One plausible micro-organism.
    2. One plausible animal-like creature (non-sentient).
    3. One plausible sentient humanoid-like species.
    For each species, provide a creative name and a brief, engaging description (30-50 words) focusing on its appearance and adaptations.
    Respond ONLY with a valid JSON array containing three objects. Each object must have keys: "category" (string: "Micro-organism", "Animal", or "Humanoid"), "name" (string), and "description" (string). Example object: {"category": "Animal", "name": "Rock-Skimmer", "description": "..."}`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAIApiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: openAIPrompt }],
        temperature: 0.8,
        max_tokens: 400, // Increase token limit for JSON + 3 descriptions
      }),
    });

    if (!openAIResponse.ok) throw new Error(`OpenAI API Error: ${openAIResponse.status}`);

    const data: OpenAIResponse = await openAIResponse.json();
    if (data.error) throw new Error(`OpenAI Error: ${data.error.message}`);

    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('OpenAI response content is empty.');

    // Attempt to parse the JSON string from the content
    const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s); // Find first array in string
    if (!jsonMatch || !jsonMatch[0]) throw new Error('Valid JSON array not found in OpenAI response.');

    speciesList = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(speciesList) || speciesList.length !== 3) {
        throw new Error('OpenAI did not return a valid array of 3 species.');
    }
    speciesList.forEach(s => {
       if (!s.category || !s.name || !s.description) throw new Error('Invalid species object structure from OpenAI.');
    });

    console.log(`Serverless: Successfully got ${speciesList.length} species descriptions from OpenAI.`);

  } catch (error: any) {
    console.error(`Serverless: Error getting species descriptions from OpenAI for ${planet}:`, error);
    return response.status(500).json({ error: `Failed to get species descriptions: ${error.message}` });
  }

  // --- 2. Call Fal.ai for Images ---
  try {
    fal.config({ credentials: falApiKey });
    console.log("Serverless: Manually configured fal client credentials.");
  } catch (configError) {
    console.error("Serverless: Error configuring fal client:", configError);
    return response.status(500).json({ error: 'Failed to configure AI client.' });
  }

  console.log(`Serverless: Requesting 3 images from Fal.ai for ${planet} species...`);

  try {
    const imagePromises = speciesList.map(species => {
      const imagePrompt = `Detailed scientific illustration of a hypothetical ${species.category.toLowerCase()} named "${species.name}" from planet ${planet}. Appearance based on this description: "${species.description}". Neutral background.`;
      const falInput: FalSubscribeInput = { prompt: imagePrompt, image_size: "square" };

      console.log(`Submitting Fal.ai for: ${species.name}`);
      return fal.subscribe("fal-ai/flux/dev", { input: falInput });
    });

    const imageResults = await Promise.allSettled(imagePromises);

    imageResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const imageUrl = result.value?.data?.images?.[0]?.url;
        if (imageUrl) {
          console.log(`Fal.ai success for ${speciesList[index].name}`);
          speciesList[index].imageUrl = imageUrl;
        } else {
          console.error(`Fal.ai image URL missing for ${speciesList[index].name}.`);
          speciesList[index].imageUrl = null;
        }
      } else if (result.status === 'rejected') {
        console.error(`Fal.ai image failed for ${speciesList[index].name}:`, result.reason);
        speciesList[index].imageUrl = null;
      }
    });

    console.log(`Serverless: Finished Fal.ai image generation attempts.`);
    response.status(200).json({ species: speciesList });

  } catch (error: any) {
    console.error(`Serverless: Error generating species images with Fal.ai for ${planet}:`, error);
    if (speciesList.length === 3) {
      speciesList.forEach(s => { if (s.imageUrl === undefined) s.imageUrl = null; });
      return response.status(200).json({ species: speciesList, image_error: `Failed during image generation: ${error.message}` });
    } else {
      return response.status(500).json({ error: `Internal Server Error generating species images: ${error.message}` });
    }
  }
};
