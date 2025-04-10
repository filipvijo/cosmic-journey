// TEMPORARY TEST api/getNasaImages.cts
// const { VercelRequest, VercelResponse } = require('@vercel/node'); // Keep removed
module.exports = async (request: any, response: any) => {
        const apiKey = process.env.NASA_API_KEY;
        console.log("--- NASA IMAGES Minimal Handler ---");
        console.log(`NASA Key found: ${!!apiKey}`); // Check if key is seen

        if (!apiKey) {
             // Use 500 status for consistency with other key errors now
             console.error("Minimal Handler: NASA Key Missing!");
             return response.status(500).json({ error: 'TEST: NASA Key Missing' });
        }

        // Return dummy data, no fetch, no shuffle
        console.log("Minimal Handler: Returning dummy data.");
        return response.status(200).json({ images: [{url: "test_ok", title: "Minimal Test OK"}] });
    };
