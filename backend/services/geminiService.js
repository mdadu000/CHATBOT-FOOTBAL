/**
 * Sportzy Bot - AI Service using Groq API
 * Model: meta-llama/llama-4-scout-17b-16e-instruct (tool calling support)
 * Fallback: llama-3.1-8b-instant
 * Real-time data: Wikipedia Search + Summary APIs (free, no key required)
 */

const Groq = require('groq-sdk');
const https = require('https');

const PRIMARY_MODEL = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';
const FALLBACK_MODEL = 'llama-3.1-8b-instant';

// Keep legacy export name for compatibility
const MODEL_ID = PRIMARY_MODEL;

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

// ─── Real-Time Search Tools ────────────────────────────────────────────────

/**
 * Search Wikipedia for sports articles matching the query.
 * Returns titles + snippets of top results.
 */
function wikipediaSearch(query) {
  return new Promise((resolve) => {
    const url =
      'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' +
      encodeURIComponent(query) +
      '&format=json&srlimit=5&utf8=1';
    https
      .get(url, { headers: { 'User-Agent': 'SportzyBot/1.0 (sports chatbot)' } }, (res) => {
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const hits = json.query.search.slice(0, 4);
            const snippets = hits.map(
              (r) => `**${r.title}**: ${r.snippet.replace(/<[^>]+>/g, '')}`
            );
            resolve(snippets.join('\n') || 'No results found.');
          } catch (e) {
            resolve('Search unavailable.');
          }
        });
      })
      .on('error', () => resolve('Search unavailable.'));
  });
}

/**
 * Fetch the full summary (intro section) of a Wikipedia article by title.
 * Returns detailed paragraph text — much richer than search snippets.
 */
function wikipediaSummary(articleTitle) {
  return new Promise((resolve) => {
    const url =
      'https://en.wikipedia.org/api/rest_v1/page/summary/' +
      encodeURIComponent(articleTitle.replace(/ /g, '_'));
    https
      .get(url, { headers: { 'User-Agent': 'SportzyBot/1.0 (sports chatbot)' } }, (res) => {
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.extract) {
              resolve(`[${json.title}]\n${json.extract}`);
            } else {
              resolve('Article not found or no summary available.');
            }
          } catch (e) {
            resolve('Article summary unavailable.');
          }
        });
      })
      .on('error', () => resolve('Summary unavailable.'));
  });
}

/**
 * Execute a tool call requested by the model.
 */
async function executeTool(name, args) {
  try {
    if (name === 'search_sports_web') {
      // Run search and summary in parallel for speed
      const [searchResults, summaryResult] = await Promise.all([
        wikipediaSearch(args.query),
        wikipediaSummary(args.article_title || args.query),
      ]);

      // If article summary was not found, try searching for the first result title
      let enrichedSummary = summaryResult;
      if (
        enrichedSummary.includes('not found') ||
        enrichedSummary.includes('unavailable')
      ) {
        // Extract first result title from search and try that
        const firstTitleMatch = searchResults.match(/\*\*([^*]+)\*\*:/);
        if (firstTitleMatch) {
          enrichedSummary = await wikipediaSummary(firstTitleMatch[1]);
        }
      }

      return [
        `SEARCH RESULTS for "${args.query}":`,
        searchResults,
        '',
        'DETAILED ARTICLE INFO:',
        enrichedSummary,
      ].join('\n');
    }
    return 'Unknown tool.';
  } catch (err) {
    return `Tool error: ${err.message}`;
  }
}

// ─── Groq Tool Schema ──────────────────────────────────────────────────────

const SPORTS_SEARCH_TOOL = {
  type: 'function',
  function: {
    name: 'search_sports_web',
    description:
      'Search the web for real-time sports information. Use this for: current standings, live scores, recent match results, player statistics, transfer news, injury updates, breaking sports news, tournament results, team line-ups, and any time-sensitive sports data. Always call this tool before answering questions about current events.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Specific search query. Be precise. Example: "Premier League 2024-25 final standings" or "Virat Kohli 2025 cricket stats retirement"',
        },
        article_title: {
          type: 'string',
          description:
            'Optional. The exact Wikipedia article title to fetch detailed info from. Example: "2024–25 Premier League" or "Virat Kohli"',
        },
      },
      required: ['query'],
    },
  },
};

// ─── System Prompt ─────────────────────────────────────────────────────────

function buildSystemInstruction({ language, preferredLanguage }) {
  const effective =
    language && language !== 'auto'
      ? language
      : preferredLanguage && preferredLanguage !== 'auto'
      ? preferredLanguage
      : 'en';

  const langLine =
    language === 'auto'
      ? `Automatically detect the user's language from their latest message and reply in that same language. If unsure, use ${LANG_NAMES[effective] || 'English'}.`
      : `Reply in ${LANG_NAMES[effective] || 'English'} (code: ${effective}).`;

  return `You are "Sportzy Bot", a highly professional sports analyst, real-time data specialist, and elite sports coach.

CRITICAL RULES:
1. ALWAYS USE THE SEARCH TOOL FIRST for any question about: current standings, recent scores, player stats in 2024/2025, transfer news, injuries, tournament results, or anything time-sensitive. Never guess or rely on old knowledge for current data.
2. After searching, synthesize the retrieved data into a clear, professional, concise answer. Cite specific numbers and dates from the search results.
3. NATURAL TONE: Respond in warm, fluid, human-like natural language. Be concise and professional. No robotic templates.
4. UNIVERSAL SPORTS COVERAGE: Cover ANY sport worldwide — Football, Cricket, Basketball, Tennis, F1, MMA, Athletics, Golf, Rugby, Baseball, Volleyball, Badminton, Swimming, Kabaddi, etc.
5. OFFICIAL RULES: For rules questions, reference official governing bodies (FIFA/IFAB Laws, MCC Laws of Cricket, FIBA/NBA Rules, ITF Tennis Rules, World Athletics, etc.).
6. NON-SPORTS QUERIES: Politely decline and redirect with an interesting sports fact.
7. ${langLine}
8. RTL: If replying in Arabic or Hebrew, respect RTL reading order.
9. FRESHNESS: When citing stats, mention when the data is from so users know how current it is.

MULTILINGUAL SUPPORT: ${Object.values(LANG_NAMES).join(', ')}.
SAFETY: Refuse harmful instructions. Focus on professional sports analytics and real-time data.`;
}

// ─── History Conversion ────────────────────────────────────────────────────

function toGroqHistory(messages) {
  return messages
    .filter((m) => {
      if (m.role !== 'user' && m.role !== 'assistant' && m.role !== 'model') return false;
      // Skip any saved messages that are raw tool-call JSON (old bug artifacts)
      if (typeof m.content === 'string' && m.content.trim().startsWith('[{"name"')) return false;
      return true;
    })
    .map((m) => ({
      role: m.role === 'model' ? 'assistant' : m.role === 'user' ? 'user' : m.role,
      content: m.content,
    }));
}

/**
 * Returns true if text looks like a raw Groq tool-call JSON blob (should never be shown to user)
 */
function isToolCallJSON(text) {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim();
  return (
    (t.startsWith('[{"name"') || t.startsWith('[{ "name"')) &&
    t.includes('search_sports_web')
  );
}

/**
 * Strip any accidental tool-call JSON that got mixed into the final content.
 */
function sanitizeContent(text) {
  if (!text) return text;
  // Remove any JSON tool-call blocks that leaked into the final answer
  return text
    .replace(/\[\{"name":"search_sports_web"[^\]]*\}\]/g, '')
    .replace(/\[\{ "name": "search_sports_web"[^\]]*\}\]/g, '')
    .trim();
}

// ─── Core Chat Function ────────────────────────────────────────────────────

/**
 * @param {{ history: { role: string, content: string }[], userMessage: string, language: string, preferredLanguage: string, stream?: boolean }} opts
 */
async function generateChatResponse(opts) {
  const { history, userMessage, language, preferredLanguage, stream } = opts;

  const key = process.env.GROQ_API_KEY;

  if (!key) {
    console.warn('[groq] No GROQ_API_KEY configured in .env');
    const reply =
      'Sportzy Bot is not configured. Please set GROQ_API_KEY in the backend .env file.';
    if (stream) {
      return {
        stream: (async function* () {
          yield { text: () => reply };
        })(),
      };
    }
    return reply;
  }

  const client = new Groq({ apiKey: key });
  const systemPrompt = buildSystemInstruction({ language, preferredLanguage });
  const pastHistory = toGroqHistory(history).slice(-30); // last 30 turns

  // Build the messages array
  const messages = [
    { role: 'system', content: systemPrompt },
    ...pastHistory,
    { role: 'user', content: userMessage },
  ];

  async function runWithModel(modelId) {
    // Step 1: Initial call with tool available
    const res1 = await client.chat.completions.create({
      model: modelId,
      messages,
      tools: [SPORTS_SEARCH_TOOL],
      tool_choice: 'auto',
      max_tokens: 1200,
      temperature: 0.6,
    });

    const choice1 = res1.choices[0];

    // Step 2: If model wants to use the search tool, execute it
    if (choice1.finish_reason === 'tool_calls' && choice1.message.tool_calls?.length) {
      const allToolMessages = [choice1.message];

      // Execute all requested tool calls
      for (const toolCall of choice1.message.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments || '{}');
        console.log(`[groq] Tool call: ${toolCall.function.name}`, JSON.stringify(args));
        const toolResult = await executeTool(toolCall.function.name, args);
        allToolMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: toolResult,
        });
      }

      // Step 3: Second call with tool results to get final answer
      const messagesWithToolResults = [...messages, ...allToolMessages];
      const res2 = await client.chat.completions.create({
        model: modelId,
        messages: messagesWithToolResults,
        max_tokens: 1200,
        temperature: 0.6,
      });

      const finalText = sanitizeContent(res2.choices[0].message.content || '');

      if (stream) {
        return {
          stream: (async function* () {
            // Stream the final answer word-by-word — never the raw tool JSON
            const words = finalText.match(/\S+\s*/g) || [finalText];
            for (const word of words) {
              // Extra safety: skip any chunk that is tool-call JSON
              if (isToolCallJSON(word)) continue;
              yield { text: () => word };
              await new Promise((r) => setTimeout(r, 12));
            }
          })(),
        };
      }
      return finalText;
    }

    // No tool call — direct answer
    const directText = sanitizeContent(choice1.message.content || '');

    // Safety: if somehow the raw tool JSON ended up as the "direct" reply, retry without tool
    if (isToolCallJSON(directText)) {
      console.warn('[groq] Tool-call JSON leaked into direct content — filtering');
      const safeReply = "I'm searching for that information. Please try asking again!";
      if (stream) {
        return {
          stream: (async function* () {
            yield { text: () => safeReply };
          })(),
        };
      }
      return safeReply;
    }

    if (stream) {
      return {
        stream: (async function* () {
          const words = directText.match(/\S+\s*/g) || [directText];
          for (const word of words) {
            if (isToolCallJSON(word)) continue;
            yield { text: () => word };
            await new Promise((r) => setTimeout(r, 12));
          }
        })(),
      };
    }
    return directText;
  }

  // Try primary model, fall back to secondary
  try {
    return await runWithModel(PRIMARY_MODEL);
  } catch (err) {
    console.error(`[groq] ${PRIMARY_MODEL} failed: ${err.message}`);
    try {
      console.warn(`[groq] Falling back to ${FALLBACK_MODEL}...`);
      return await runWithModel(FALLBACK_MODEL);
    } catch (err2) {
      console.error(`[groq] ${FALLBACK_MODEL} also failed: ${err2.message}`);
      const reply =
        "I'm having trouble connecting right now. Please try again in a moment!";
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
}

module.exports = {
  generateChatResponse,
  buildSystemInstruction,
  MODEL_ID,
  LANG_NAMES,
};
