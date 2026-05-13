const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        // Usually there isn't a direct list method exposed easily in all SDK versions without complications, 
        // but let's try a simple generation to see if gemini-pro works.

        console.log("Trying gemini-pro...");
        const result = await model.generateContent("Hello");
        console.log("Gemini-Pro Works:", result.response.text());

        console.log("Trying gemini-2.5-flash...");
        const flash = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const resultFlash = await flash.generateContent("Hello");
        console.log("gemini-2.5-Flash Works:", resultFlash.response.text());

    } catch (error) {
        console.log("Error:", error.toString());
    }
}

listModels();
