import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Activity,
  Download,
  Eraser,
  LogOut,
  Menu,
  MessageCircle,
  Mic,
  MicOff,
  Moon,
  Send,
  Sun,
  UserRound,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { LANGUAGES, speechLangFor } from '../lib/languages.js';
import { api } from '../services/api.js';
import { streamChat } from '../services/chatStream.js';
import { useSpeechOutput } from '../hooks/useSpeechOutput.js';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant.js';
import { ChatSidebar } from '../components/chat/ChatSidebar.jsx';
import { MessageBubble } from '../components/chat/MessageBubble.jsx';

const WELCOME = {
  role: 'model',
  content:
    "Yo fam! You're live with **SportyGenZ** — your multilingual, sports-only Gen-Z co-pilot. Ask about any league, player, or moment worth debating. No cap, we keep it on the pitch. ⚽🔥",
};

function uid() {
  return crypto.randomUUID();
}

export default function ChatDashboard() {
  const { user, token, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [language, setLanguage] = useState('auto');
  const [messages, setMessages] = useState(() => [{ id: uid(), ...WELCOME, streaming: false }]);
  const [chatId, setChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const thinkingRef = useRef(false);
  const [voiceGender, setVoiceGender] = useState('male');
  const [muted, setMuted] = useState(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    thinkingRef.current = thinking;
  }, [thinking]);

  const { speak, cancel: cancelSpeech, speaking } = useSpeechOutput();

  const effectiveLang = useMemo(() => {
    if (language !== 'auto') return language;
    return user?.preferredLanguage || 'en';
  }, [language, user?.preferredLanguage]);

  const scrollBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  useEffect(() => {
    scrollBottom();
  }, [messages, thinking, scrollBottom]);

  const loadChats = useCallback(async () => {
    try {
      const { data } = await api.get('/api/chats');
      setChats(data.chats || []);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const loadChat = useCallback(async (id) => {
    const { data } = await api.get(`/api/chats/${id}`);
    const mapped =
      data.chat?.messages?.map((m) => ({
        id: m.id || uid(),
        role: m.role,
        content: m.content,
        streaming: false,
      })) || [];
    setChatId(id);
    setMessages(mapped.length ? mapped : [{ id: uid(), ...WELCOME, streaming: false }]);
  }, []);

  const newChat = useCallback(() => {
    abortRef.current?.abort();
    setChatId(null);
    setMessages([{ id: uid(), ...WELCOME, streaming: false }]);
  }, []);

  const handleSendText = useCallback(
    async (text, fromVoice = false) => {
      if (!text.trim() || thinkingRef.current) return;
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const userMsg = { id: uid(), role: 'user', content: text, fromVoice };
      const botId = uid();
      setMessages((m) => [...m, userMsg, { id: botId, role: 'model', content: '', streaming: true }]);
      thinkingRef.current = true;
      setThinking(true);
      cancelSpeech();

      let assembled = '';
      try {
        await streamChat(
          {
            message: text,
            chatId,
            language,
            token,
            signal: ac.signal,
          },
          {
            onMeta: (d) => {
              if (d.chatId) setChatId(d.chatId);
            },
            onToken: (t) => {
              assembled += t;
              setMessages((prev) =>
                prev.map((msg) => (msg.id === botId ? { ...msg, content: assembled, streaming: true } : msg))
              );
            },
            onDone: (d) => {
              if (d.chatId) setChatId(d.chatId);
            },
          }
        );
        setMessages((prev) =>
          prev.map((msg) => (msg.id === botId ? { ...msg, content: assembled, streaming: false } : msg))
        );
        const bcp = speechLangFor(effectiveLang);
        speak(assembled, bcp, voiceGender, muted);
        await loadChats();
      } catch (e) {
        if (e.name === 'AbortError') return;
        const fallback = "Yo — that play didn't connect. Retry in a sec?";
        toast.error(e.message || 'Chat request failed');
        setMessages((prev) =>
          prev.map((msg) => (msg.id === botId ? { ...msg, content: fallback, streaming: false } : msg))
        );
      } finally {
        thinkingRef.current = false;
        setThinking(false);
      }
    },
    [chatId, language, token, cancelSpeech, speak, voiceGender, muted, effectiveLang, loadChats]
  );

  const onVoiceFinal = useCallback(
    (text) => {
      if (!text.trim() || thinkingRef.current) return;
      void handleSendText(text.trim(), true);
    },
    [handleSendText]
  );

  const { supported: voiceSupported, listening, interim, startListening, stopListening } = useVoiceAssistant({
    onFinalMessage: onVoiceFinal,
    languageCode: effectiveLang,
  });

  const onSubmit = (e) => {
    e.preventDefault();
    const t = input.trim();
    if (!t) return;
    setInput('');
    handleSendText(t, false);
  };

  const clearChat = () => {
    cancelSpeech();
    newChat();
    toast.success('Fresh pitch — new thread ready.');
  };

  const exportChat = () => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sportygenz-chat-${chatId || 'draft'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteRemote = async (id) => {
    try {
      await api.delete(`/api/chats/${id}`);
      toast.success('Thread deleted.');
      if (chatId === id) newChat();
      await loadChats();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const aiStatus = listening ? 'Listening' : thinking ? 'Thinking' : speaking ? 'Speaking' : 'Idle';

  return (
    <div className="flex h-full min-h-0 bg-gradient-to-br from-pitch-bg via-[#0b0f14] to-pitch-bg">
      <ChatSidebar
        chats={chats}
        activeChatId={chatId}
        onSelect={loadChat}
        onNew={newChat}
        onDelete={(id) => deleteRemote(id)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3 backdrop-blur-md md:px-6">
          <button
            type="button"
            className="rounded-xl p-2 hover:bg-white/5 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Activity className="hidden h-7 w-7 text-neon md:block" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-tight">SportyGenZ</h1>
            <p className="truncate text-xs text-slate-500">Signed in as {user?.name}</p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-300 md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_8px_#00ff9d]" />
            AI: {aiStatus}
          </div>
          <div className="flex items-center gap-1">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="max-w-[7.5rem] rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs outline-none md:max-w-[10rem]"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-white/5"
              onClick={toggle}
              title="Toggle theme"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/profile" className="rounded-lg p-2 hover:bg-white/5" title="Profile">
              <UserRound className="h-5 w-5" />
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-rose-300 hover:bg-white/5"
              title="Logout"
              onClick={() => {
                cancelSpeech();
                logout();
              }}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="scroll-thin flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-8">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                role={m.role}
                content={m.content}
                streaming={m.streaming}
                fromVoice={m.fromVoice}
              />
            ))}
          </AnimatePresence>
          {thinking && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MessageCircle className="h-4 w-4 animate-bounce text-neon" />
              SportyGenZ is cooking up a take…
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-pitch-panel/80 px-4 py-3 backdrop-blur-xl md:px-8">
          {interim && (
            <div className="mb-2 rounded-xl border border-neon/20 bg-neon/5 px-3 py-2 text-xs text-neon">
              <span className="font-semibold">Live transcript: </span>
              {interim}
            </div>
          )}

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/30 p-1">
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-medium ${voiceGender === 'male' ? 'bg-neon text-pitch-bg' : 'text-slate-400'}`}
                onClick={() => setVoiceGender('male')}
              >
                Male voice
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-medium ${voiceGender === 'female' ? 'bg-neon text-pitch-bg' : 'text-slate-400'}`}
                onClick={() => setVoiceGender('female')}
              >
                Female voice
              </button>
            </div>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {muted ? 'Muted' : 'Talkback on'}
            </button>
            {!voiceSupported && (
              <span className="text-xs text-amber-400">Voice not supported in this browser.</span>
            )}
          </div>

          <div className="mb-3 flex items-center gap-3">
            <div className="flex gap-1">
              {listening &&
                [0, 1, 2, 3, 4].map((i) => (
                  <motion.span
                    key={i}
                    className="block h-6 w-1 rounded-full bg-neon"
                    animate={{ scaleY: [0.4, 1, 0.5], opacity: [0.5, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.08 }}
                  />
                ))}
            </div>
            <button
              type="button"
              disabled={!voiceSupported || thinking}
              onClick={() => (listening ? stopListening() : startListening())}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                listening ? 'bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/40' : 'bg-neon/20 text-neon ring-1 ring-neon/40'
              } disabled:opacity-40`}
            >
              {listening ? (
                <>
                  <MicOff className="h-4 w-4" /> Stop listening
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" /> Start listening
                </>
              )}
            </button>
            {speaking && (
              <span className="flex items-center gap-2 text-xs text-neon">
                <span className="inline-flex h-2 w-2 animate-ping rounded-full bg-neon" />
                AI is speaking…
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={clearChat}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
            >
              <Eraser className="h-3.5 w-3.5" />
              Clear chat
            </button>
            <button
              type="button"
              onClick={exportChat}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
            >
              <Download className="h-3.5 w-3.5" />
              Export JSON
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-3 flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none ring-neon/20 focus:ring-2"
              placeholder="Ask about any sport…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={thinking}
            />
            <button
              type="submit"
              disabled={thinking || !input.trim()}
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-neon px-5 py-3 text-sm font-semibold text-pitch-bg shadow-neon disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
