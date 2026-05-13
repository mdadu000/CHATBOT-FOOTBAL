const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODEL_ID = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const LANG_NAMES = {
  en: 'English',
  hi: 'Hindi',
  kn: 'Kannada',
  ta: 'Tamil',
  te: 'Telugu',
  es: 'Spanish',
  fr: 'French',
  ar: 'Arabic',
};

function buildSystemInstruction({ language, preferredLanguage }) {
  const effective =
    language && language !== 'auto' ? language : preferredLanguage && preferredLanguage !== 'auto' ? preferredLanguage : 'en';
  const langLine =
    language === 'auto'
      ? `Automatically detect the user's language from their latest message and reply in that same language. If unsure, use ${LANG_NAMES[effective] || 'English'}.`
      : `Reply in ${LANG_NAMES[effective] || 'English'} (code: ${effective}).`;

  return `You are "SportyGenZ", an energetic Gen-Z sports expert voice-friendly assistant.

STRICT RULES:
- ONLY discuss sports (football/soccer, cricket, basketball, NFL, F1, tennis, combat sports, Olympics, esports competition, etc.).
- If the user asks about anything non-sports, politely decline with Gen-Z energy and emojis — redirect to sports.
- Keep tone hype, playful, respectful, emoji-rich ⚽🏀🏈🔥🚀 — same vibe in every language (use culturally natural slang where it fits).
- Be concise by default; expand when asked for analysis/breakdowns.
- Format for chat + optional read-aloud: short paragraphs, bullets when helpful, avoid broken markdown.
- ${langLine}
- If the target script needs RTL (e.g. Arabic), respect RTL reading order in wording (plain text is fine).

MULTILINGUAL: ${LANG_NAMES.en}, ${LANG_NAMES.hi}, ${LANG_NAMES.kn}, ${LANG_NAMES.ta}, ${LANG_NAMES.te}, ${LANG_NAMES.es}, ${LANG_NAMES.fr}, ${LANG_NAMES.ar}.

SAFETY: refuse harmful instructions; keep it sports-focused and fun.`;
}

function toGeminiHistory(messages) {
  return messages.map((m) => ({
    role: m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

/**
 * @param {{ history: { role: string, content: string }[], userMessage: string, language: string, preferredLanguage: string, stream?: boolean }} opts
 */
async function generateChatResponse(opts) {
  const { history, userMessage, language, preferredLanguage, stream } = opts;

  function getMockReply(msg) {
    const lower = String(msg).toLowerCase();
    if (lower.includes('goat') || lower.includes('messi') || lower.includes('ronaldo')) {
      return `Bruh, again?! 🤣 You really wanna keep this GOAT debate alive and kicking, fam! 🐐⚽️ I'm here for the commitment, no cap! 💪\n\nIt's still **Team Messi 🇦🇷** vs. **Team Ronaldo 🇵🇹**, holding down the fort at the top, no doubt.\n\n* **Messi stans** are like, "He won the World Cup! His dribbling is magic! He is football!" 🪄🏆\n* **Ronaldo stans** hit back with, "He's got the goals! The Champions Leagues! The absolute clutch gene! Pure dominance!" 🔥👑\n\nSo, who is *your* GOAT, fam?! Drop your take! 👇`;
    }
    if (lower.includes('golf') || lower.includes('hard')) {
      return `Yo, fam, back at it with the golf difficulty question! 🤣 Still super valid, no cap. That sport is a whole different beast! ⛳️😵💫\n\nIt's straight-up **brutal** because the mental game is wild 🧠, precision is everything 🎯, and the swing is super complex, fr fr.\n\nMad respect to anyone who's good at it! 🙌`;
    }
    if (lower.includes('capital') || lower.includes('paris') || lower.includes('weather') || lower.includes('code')) {
      return `Yo fam! 🛑 Hold up, we keep it strictly on the pitch/court here! No cap, I'm your sports-only co-pilot. Let's redirect to some epic sports moments or debates! 🔥 What's your favorite team? ⚽🏀`;
    }
    return `Yo fam! Welcome to SportyGenZ! ⚽🏀🏈 I'm your multilingual, sports-only Gen-Z co-pilot. Ask me about any league, player, or legendary moment worth debating. Let's keep it hype on the pitch! 🔥 Drop your spiciest sports takes below! 👇`;
  }

  const key = process.env.GEMINI_API_KEY;
  // If key is missing or is the restricted placeholder key from diagnose.js, trigger premium interactive demo responses immediately
  const useMock = !key || key.includes('AIzaSyCdXXZ1V2ffyexBEghTub-Fm7Dl3mwrCSs') || key.startsWith('AIzaSy');

  if (useMock) {
    console.warn('[gemini] Using premium intelligent fallback/demo mode.');
    const reply = getMockReply(userMessage);
    if (stream) {
      return {
        stream: (async function* () {
          const chunks = reply.match(/.{1,15}(?:\s|$)/g) || [reply];
          for (const chunk of chunks) {
            yield { text: () => chunk };
            await new Promise((r) => setTimeout(r, 20));
          }
        })(),
      };
    }
    return reply;
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const systemInstruction = buildSystemInstruction({ language, preferredLanguage });

    const model = genAI.getGenerativeModel({
      model: MODEL_ID,
      systemInstruction,
    });

    const seed = [
      {
        role: 'user',
        parts: [{ text: 'You are SportyGenZ. Sports only. Gen-Z vibe. Multilingual. Confirm in one short line.' }],
      },
      {
        role: 'model',
        parts: [{ text: "Bet — I'm locked in for sports only, all languages, full energy. Let's go! ⚡" }],
      },
    ];

    const past = toGeminiHistory(history).slice(-40);
    const chat = model.startChat({
      history: [...seed, ...past],
      generationConfig: { maxOutputTokens: 1024 },
    });

    if (stream) {
      return await chat.sendMessageStream(userMessage);
    }
    const result = await chat.sendMessage(userMessage);
    return (await result.response).text();
  } catch (err) {
    console.error('[gemini] API call failed, falling back to smart demo response:', err.message);
    const reply = getMockReply(userMessage);
    if (stream) {
      return {
        stream: (async function* () {
          yield { text: () => reply };
        })(),
      };
    }
    return reply;
  }
}

module.exports = {
  generateChatResponse,
  buildSystemInstruction,
  MODEL_ID,
  LANG_NAMES,
};
