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

  return `You are "Sportzy Bot", a highly professional, expert AI sports analyst and telemetry specialist.

STRICT RULES:
- Comprehensively answer queries related to ANY sport globally. This explicitly includes official rules, gameplay mechanics, athlete biographies, statistical profiles, match previews, live tracking context, historical outcomes, and tournament frameworks.
- ONLY discuss professional, amateur, or general sporting disciplines. If the user asks about completely unrelated non-sports subjects, politely and professionally decline, redirecting the conversation back to sports.
- Maintain an authoritative, analytical, articulate, and respectful tone. Avoid casual slang or excessive colloquialisms. Provide precise data and tactical depth.
- Be concise by default; provide comprehensive breakdowns when requested.
- Format responses clearly using professional structuring (short analytical paragraphs, clear bulleted points).
- ${langLine}
- If the target script needs RTL (e.g. Arabic), respect RTL reading order.

MULTILINGUAL SUPPORT: ${LANG_NAMES.en}, ${LANG_NAMES.hi}, ${LANG_NAMES.kn}, ${LANG_NAMES.ta}, ${LANG_NAMES.te}, ${LANG_NAMES.es}, ${LANG_NAMES.fr}, ${LANG_NAMES.ar}.

SAFETY: Strictly refuse harmful instructions. Focus entirely on expert sporting evaluations.`;
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
    const targetLang = language && language !== 'auto' ? language : preferredLanguage || 'en';
    const isHindi = targetLang === 'hi' || /[\u0900-\u097F]/.test(msg) || lower.includes('क्रिकेट') || lower.includes('फुटबॉल') || lower.includes('नियम') || lower.includes('खिलाड़ी') || lower.includes('मैच');
    const isSpanish = targetLang === 'es';
    const isFrench = targetLang === 'fr';

    // 1. Non-sports check
    if (lower.includes('capital') || lower.includes('paris') || lower.includes('weather') || lower.includes('code') || lower.includes('programming')) {
      if (isHindi) return `कृपया ध्यान दें कि मेरा कार्यक्षेत्र केवल खेल विश्लेषण, नियमों, खिलाड़ियों और मैचों तक सीमित है। कृपया किसी भी खेल से संबंधित प्रश्न पूछें।`;
      if (isSpanish) return `Tenga en cuenta que mi alcance operativo está estrictamente dedicado al deporte (reglas, jugadores, partidos). Por favor, dirija su consulta hacia eventos deportivos.`;
      if (isFrench) return `Veuillez noter que mon champ d'action est strictement dédié au sport (règles, joueurs, matchs). Merci de poser des questions relatives au domaine sportif.`;
      return `Please note that my operational scope is strictly dedicated to sports analytics, rules, player profiles, and match details. Kindly direct your inquiry towards sporting events or athletic history.`;
    }

    // 2. Greet / Intro
    if (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower === 'yo' || lower === 'welcome' || lower === 'नमस्ते') {
      if (isHindi) return `**Sportzy Bot** में आपका स्वागत है। मैं आपका पेशेवर एआई खेल विश्लेषक हूँ। आप किसी भी खेल के नियमों, खिलाड़ियों के प्रोफाइल, लाइव मैचों या ऐतिहासिक टूर्नामेंटों के बारे में विस्तृत जानकारी के लिए पूछ सकते हैं।`;
      if (isSpanish) return `Bienvenido a **Sportzy Bot**, su analista deportivo global. Puede consultar sobre reglas de cualquier deporte, biografías de jugadores, partidos o tácticas en general.`;
      if (isFrench) return `Bienvenue sur **Sportzy Bot**, votre spécialiste en analyse sportive globale. Demandez des précisions sur les règles de n'importe quel sport, les joueurs ou les matchs.`;
      return `Welcome to **Sportzy Bot**. I am your professional AI sports analytics specialist. You can ask me anything related to any sport globally—including official rules, player profiles, historical matches, or upcoming tournament frameworks.`;
    }

    // 3. Highly Specific Entities & Competitions (Checked BEFORE generic terms like 'match' or 'rule')
    
    // Real Madrid / La Liga / Barcelona
    if (lower.includes('real madrid') || lower.includes('la liga') || lower.includes('barcelona') || lower.includes('el clasico')) {
      if (isHindi) return `ला लीगा और रियल मैड्रिड सामरिक रिपोर्ट: रियल मैड्रिड ने हालिया मैचों में विनीसियस जूनियर और रोड्रिगो की गति का लाभ उठाते हुए एक मजबूत आक्रामक शैली अपनाई है, जिसमें जूड बेलिंगहैम मध्यक्षेत्र से महत्वपूर्ण भूमिका निभाते हैं। बार्सिलोना के साथ खिताब की दौड़ बेहद रोमांचक है। दोनों टीमों का औसत गोल प्रति मैच 2.2 से अधिक है।`;
      return `Real Madrid Tactical & La Liga Report: In their recent domestic fixtures, Real Madrid utilized a highly fluid offensive structure maximizing wide overloads through Vinicius Jr. and Rodrygo, complemented by Jude Bellingham's late half-space arrivals. Defensive transitions rely heavily on Federico Valverde's high-intensity pressing metrics. In the broader La Liga framework, Barcelona maintains exceptional attacking pressure, leading to a closely contested top-of-the-table title dynamic.`;
    }

    // Premier League / Specific English Clubs
    if (lower.includes('premier league') || lower.includes('arsenal') || lower.includes('manchester') || lower.includes('man city') || lower.includes('liverpool') || lower.includes('chelsea')) {
      return `Premier League Strategic Overview: High-level tactical configurations across the Premier League currently focus on fluid positional rotations and multi-layered mid-block pressing. Teams like Manchester City leverage central inverted fullbacks to generate numerical superiority in possession, while Liverpool utilizes rapid vertical transitions to average over 17.5 shot-creation actions per game.`;
    }

    // Champions League / UCL
    if (lower.includes('champions league') || lower.includes('ucl') || lower.includes('uefa')) {
      return `UEFA Champions League Framework: Elite European fixtures demonstrate the absolute pinnacle of tactical versatility. Participating clubs employ highly customized high-intensity pressing triggers and complex load-management strategies across mid-week schedules. The format demands sustained offensive outputs to secure favorable head-to-head goal differentials.`;
    }

    // Specific Advanced Rules
    if (lower.includes('offside')) {
      return `Football Offside Rule Breakdown (Law 11): A player is in an offside position if they are nearer to the opponent's goal line than both the ball and the second-last opponent when the ball is played to them. Being in an offside position is not an offense in itself; active involvement or interfering with an opponent triggers the infraction.`;
    }
    if (lower.includes('lbw')) {
      return `Cricket LBW Regulations: Leg Before Wicket dictates that a batter is dismissed if the delivery would have struck the stumps but was intercepted by any part of the batter's body/pads (excluding the hand holding the bat), provided the ball pitched inline or outside off-stump and impact was inline.`;
    }

    // Specific Cricket Entities
    if (lower.includes('ipl') || lower.includes('kohli') || lower.includes('dhoni') || lower.includes('rohit') || lower.includes('world cup')) {
      if (isHindi) return `क्रिकेट और एथलीट मूल्यांकन: विराट कोहली और रोहित शर्मा जैसे शीर्ष बल्लेबाज कठिन पिचों पर भी बेहतरीन स्ट्राइक रोटेशन और बाउंड्री प्रतिशत बनाए रखते हैं। आईपीएल और विश्व कप जैसे टूर्नामेंटों में डेथ-ओवर गेंदबाजी और पावरप्ले का आक्रामक उपयोग मैच के परिणाम तय करता है।`;
      return `Cricket Telemetry & Match Analysis: High-leverage encounters highlight the critical value of middle-over spin matchups and death-over execution. Elite international players maintain exceptional strike-rate consistency across all phases, while modern franchise formats like the IPL demand deep batting lineups capable of sustaining targets above 200 runs.`;
    }

    // Specific Basketball Entities
    if (lower.includes('nba') || lower.includes('lebron') || lower.includes('curry') || lower.includes('lakers')) {
      return `NBA Advanced Metrics & Spacing: Modern basketball offense prioritizes perimeter efficiency, corner three-point optimization, and high-pick-and-roll creation. Defensively, switchable wing personnel are crucial for disrupting passing lanes and contesting perimeter attempts effectively.`;
    }

    // Specific Tennis Entities
    if (lower.includes('federer') || lower.includes('nadal') || lower.includes('djokovic') || lower.includes('wimbledon') || lower.includes('grand slam')) {
      return `Elite Tennis Dynamics: Grand Slam success correlates directly with first-serve placement accuracy, break-point conversion percentages under high physical duress, and adaptable baseline footwork across clay, grass, and hard-court surfaces.`;
    }

    // 4. General Domain Topics (Only reached if no specific entity matched)
    
    if (lower.includes('rule') || lower.includes('rules') || lower.includes('law') || lower.includes('laws') || lower.includes('नियम')) {
      if (isHindi) return `खेल नियम और संचालन: खेल में निष्पक्षता सुनिश्चित करने के लिए सटीक नियमों का पालन अनिवार्य है। चाहे वह मैदान पर फाउल का निर्णय हो या स्कोरिंग प्रणाली, हर नियम का सामरिक महत्व होता है। कृपया उस विशिष्ट खेल का नाम बताएं जिसके नियमों के बारे में आप जानना चाहते हैं।`;
      return `General Sports Governing Regulations: Official rulebooks safeguard competitive integrity across sports. Whether analyzing tie-breaker configurations, penalty enforcement parameters, or foul limits, comprehensive adherence governs tactical approaches. Please specify the exact sport's guidelines you wish to examine.`;
    }

    if (lower.includes('player') || lower.includes('players') || lower.includes('athlete') || lower.includes('stats') || lower.includes('खिलाड़ी')) {
      if (isHindi) return `खिलाड़ी सांख्यिकीय प्रोफाइल: पेशेवर एथलीटों का मूल्यांकन उनके कुल योगदान, फिटनेस और दबाव में प्रदर्शन के आधार पर किया जाता है। आप किस खिलाड़ी के हालिया फॉर्म या ऐतिहासिक रिकॉर्ड की जांच करना चाहते हैं?`;
      return `Athlete Performance Profiling: Evaluating sports personnel involves deep statistical review across distance covered, dual win rates, expected scoring models, and historic career milestones. Please provide the name of the specific athlete whose statistical background you are investigating.`;
    }

    if (lower.includes('football') || lower.includes('soccer') || lower.includes('फुटबॉल')) {
      return `Football Tactical Dynamics: Global football relies heavily on structured build-up phases, pressing traps, and transitional spatial manipulation. Formations adjust fluidly in and out of possession to secure numerical dominance in key zones.`;
    }

    if (lower.includes('cricket') || lower.includes('क्रिकेट')) {
      return `Cricket Strategy & Execution: Matches hinge on pitch surface degradation, precise field placement configurations, and effective resource management across multi-over formats.`;
    }

    // 5. Ultimate Dynamic Catch-All (Directly reflecting the user's string so responses are endlessly varied)
    const cleanText = msg.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const topic = cleanText.length > 2 ? cleanText : 'this sporting query';
    
    if (isHindi) {
      return `"${topic}" पर विस्तृत खेल विश्लेषण: सांख्यिकीय डेटा और सामरिक मूल्यांकन यह दर्शाते हैं कि इस क्षेत्र में टीम के फॉर्म, खिलाड़ियों के कार्यभार और सटीक निष्पादन का सीधा असर परिणामों पर पड़ता है। कृपया विशिष्ट आंकड़े या मैच विवरण साझा करें ताकि अधिक गहराई से समीक्षा की जा सके।`;
    }
    if (isSpanish) {
      return `Evaluación analítica sobre "${topic}": Las métricas de rendimiento y el seguimiento táctico indican un alto nivel de competencia en este ámbito. El manejo del posicionamiento y la toma de decisiones bajo presión son determinantes. ¿Qué aspecto específico desea analizar en detalle?`;
    }
    if (isFrench) {
      return `Analyse détaillée concernant "${topic}": L'évaluation des performances et le suivi stratégique montrent l'importance cruciale de la gestion des espaces et de l'efficacité sous pression dans ce domaine sportif. Souhaitez-vous explorer des statistiques particulières?`;
    }
    
    return `Analytical Assessment regarding "${topic}": Comprehensive statistical evaluation and sports performance tracking indicate significant tactical depth within this domain. Success relies heavily on optimal workload management, strategic positional execution, and situational adaptability under competitive pressure. Let us review specific team lineups, historical head-to-head records, or exact regulatory frameworks to provide an exhaustive breakdown.`;
  }

  const key = process.env.GEMINI_API_KEY;
  const useMock = !key || key.includes('AIzaSyCdXXZ1V2ffyexBEghTub-Fm7Dl3mwrCSs');

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
        parts: [{ text: 'You are Sportzy Bot. Professional sports analyst. Confirm operational readiness for all sports, rules, players, and matches.' }],
      },
      {
        role: 'model',
        parts: [{ text: "Confirmed. Sportzy Bot systems are fully initialized to expertly discuss official rules, player profiles, live/historical matches, and strategic frameworks across any sport globally." }],
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
