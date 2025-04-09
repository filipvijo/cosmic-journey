import dotenv from 'dotenv';
import path from 'path'; // Make sure path is imported too

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const { VercelRequest, VercelResponse } = require('@vercel/node');
const { fal } = require('@fal-ai/client'); // Uncommented and using require

// Input type for fal.subscribe (only valid props based on docs)
interface FalSubscribeInput {
    prompt: string;
    image_size?: string | { width: number; height: number }; // Example, adjust based on docs
    // Add other valid params from docs if needed
}

module.exports = async (request: any, response: any) => { // Use any for request and response
  const { planet } = request.query;
  const apiKey = process.env.FAL_KEY; // Use FAL_KEY

  console.log(`Landscape Fn: Checking FAL_KEY: ${apiKey ? 'Found' : 'Not Found!'}`);

  if (!planet || typeof planet !== 'string') {
    return response.status(400).json({ error: 'Planet query parameter is required.' });
  }
  if (!apiKey) {
    console.error('Serverless: FAL_KEY environment variable is not configured.');
    return response.status(500).json({ error: 'AI configuration error (Fal.ai key missing).' });
  }

  // --- Define Prompt Conditionally ---
  const planetNameLower = planet.toLowerCase();
  let prompt = "";
  let generateImage = true;
  // Default negative prompt (useful conceptually, but NOT sent to this specific model)
  // const negative_prompt = "text, labels, watermarks, ui elements, people, humans, astronauts, spacecraft, blurry, low quality, drawing, illustration, sketch, schematic, diagram";

  if (["mercury", "venus", "earth", "mars"].includes(planetNameLower)) {
      // Rocky Planets                                                          
      prompt = `A highly detailed, photo-realistic landscape view from the surface of the planet ${planet}. Based on scientific data (${planet === 'Mars' ? 'reddish rocks and soil, thin hazy atmosphere' : 'varied rocky terrain'}). Daytime, conditions appropriate for the planet. Vast perspective, wide angle view.`;
  } else if (["jupiter", "saturn"].includes(planetNameLower)) {
      // Gas Giants
      prompt = `A highly detailed, photo-realistic view looking down at the turbulent, swirling cloud tops and atmospheric bands of the gas giant planet ${planet}, as seen from high orbit. Dramatic lighting, deep space background. ${planetNameLower === 'saturn' ? 'Prominent, detailed planetary rings clearly visible.' : ''}`;
  } else if (["uranus", "neptune"].includes(planetNameLower)) {
      // Ice Giants
      prompt = `A highly detailed, photo-realistic view looking down at the hazy, atmospheric cloud tops (${planetNameLower === 'uranus' ? 'pale cyan' : 'deep blue'}) of the ice giant planet ${planet}, as seen from high orbit. Dim lighting from the distant Sun, deep space background.`;
  } else if (planetNameLower === 'sun') {
      // The Sun - User's Sci-Fi Prompt
       prompt = `Standing on the surface of the sun, a surreal and impossible scene unfolds — molten solar flares erupt around me like dancing infernos, the sky above is an intense swirl of glowing plasma and golden storm clouds. The ground is a sea of churning lava, blinding light reflects off every wave. I wear a futuristic heat-proof exosuit glowing with blue energy, surrounded by pillars of fire and magnetic storms. Everything pulses with raw, cosmic energy. (Cinematic wide-angle view, extreme lighting contrast, hyperreal detail, science fiction atmosphere, lens flares and volumetric light)`;
       console.log(`Serverless: Using custom Sci-Fi prompt for the Sun.`);
  } else {
      // Default for unknown planets/moons etc.
      console.log(`Serverless: No specific landscape prompt for ${planet}. Skipping.`);
      generateImage = false;
  }

  // Only proceed if we decided to generate an image
  if (!generateImage) {
      return response.status(200).json({ imageUrl: null, message: `Image generation skipped for ${planet}.` });
  }
  // --- End Conditional Prompt ---


  // Uncomment the fal.config(...) block
  try {
      fal.config({ credentials: apiKey });
      console.log("Serverless: Manually configured fal client credentials.");
  } catch(configError) {
      console.error("Serverless: Error configuring fal client:", configError);
      return response.status(500).json({ error: 'Failed to configure AI client.' });
  }

  console.log(`Serverless: Calling Fal.ai client subscribe for ${planet}`); // Log *before* the call

  // Uncomment the try...catch block containing fal.subscribe(...)
  try {
      const falInput: FalSubscribeInput = {
          prompt: prompt,
          image_size: "landscape_16_9",
      };

      const result: any = await fal.subscribe("fal-ai/flux/dev", {
          input: falInput,
          logs: true,
          onQueueUpdate: (update) => {
              if (update.status === "IN_PROGRESS" && update.logs) {
                  update.logs.map((log) => log.message).forEach(msg => console.log(`Fal Progress (${planet}):`, msg));
              }
          },
      });

      console.log(`Serverless: Fal.ai result for ${planet}:`, JSON.stringify(result, null, 2));
      const imageUrl = result?.data?.images?.[0]?.url;

      if (!imageUrl) {
          console.error('Serverless: Fal.ai result did not contain image URL at data.images[0].url');
          return response.status(500).json({ error: 'AI image generation succeeded but no URL found in response.', data: result });
      }

      console.log(`Serverless: Extracted image URL for ${planet}: ${imageUrl}`);
      response.status(200).json({ imageUrl: imageUrl });

  } catch (error: any) {
      console.error(`Serverless: Error calling Fal.ai client for ${planet}:`, error);
      response.status(500).json({ error: `Internal Server Error generating image: ${error.message}` });
  }
};
