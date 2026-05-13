const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyCdXXZ1V2ffyexBEghTub-Fm7Dl3mwrCSs";
const genAI = new GoogleGenerativeAI(API_KEY);

async function main() {
    try {
        // There is no listModels on genAI in node SDK easily.
        // We have to try models one by one.
        const models = ["gemini-pro", "gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-pro", "gemini-2.0-flash-exp"];

        for (const m of models) {
            console.log(`Checking ${m}...`);
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("Hi");
                console.log(`SUCCESS: ${m}`);
                console.log(result.response.text());
                break; // Found one!
            } catch (e) {
                console.log(`FAIL: ${m} -> ${e.message.substring(0, 100)}...`);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

main();
