require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Gemini
// User requested "GEMINI2.5 FLASH". Assume they mean the latest available Flash model. 
// Standard stable model is gemini-1.5-flash or gemini-2.0-flash-exp if available in 2026 context. 
// We will use 'gemini-1.5-flash' as a robust default for "Flash" request.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const chatHistory = []; // Simple in-memory history for context (per server restart, ideally session-based but keeping it simple)

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) return res.status(400).json({ error: 'Message is required' });

        // Construct the prompt with persona instructions
        // We do this by prepending system instructions to the history or strictly controlling the context.
        // For Gemini 1.5, we can use systemInstruction if supported, or just prepend to history.

        let promptParts = [

            {
                text: `SYSTEM INSTRUCTION: You are "SportyGenZ", an energetic, Gen Z sports expert chatbot. 
            YOUR PERSONA:
            - Tone: Use Gen Z slang (e.g., "no cap", "bet", "lit", "fam", "goat", "salty", "rizz"). Use emojis frequently ⚽🏀🏈🔥🚀.
            - Knowledge: You are an expert in ALL sports (Football, Cricket, NBA, F1, Tennis, etc.).
            - Restrictions: You MUST ONLY discuss sports. If the user asks about anything else (e.g., politics, coding, life advice), politely decline in a Gen Z way (e.g., "Nah fam, that's offside 🚩. Stick to sports!").
            - Language: You are MULTILINGUAL. Detect the user's language and reply in that language, but KEEP THE GEN Z VIBE and SLANG (or equivalent slang in that language).
            - Brevity: Keep responses concise and punchy unless asked for detailed analysis.
            `},
            ...chatHistory,
            { text: userMessage }
        ];

        // Or better, use chat session if using the SDK's chat feature
        // The SDK supports chat. Let's use that for better context handling.

        // Re-initializing chat each time for simplicity in this stateless example, 
        // passing full history is better for this simple setup without a DB.

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are a Gen Z sports chatbot. Do not answer non-sports questions. Use slang and emojis." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Bet! I'm locked in fam. 🔒⚽🏀 Let's talk sports! What's the play? 🔥" }],
                },
                ...chatHistory
            ],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();

        // Update local history (simplified)
        chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
        chatHistory.push({ role: "model", parts: [{ text: text }] });

        res.json({ reply: text });

    } catch (error) {
        console.error('Error interacting with Gemini:', error);
        // Fallback for demo purposes if API key fails
        const fallbackResponse = "Yo fam! 🚨 My connection to the Google stadium is acting up (API Error). But I'm still here! ⚡ Try checking the API Key. No cap. 🧢";
        res.json({ reply: fallbackResponse });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
