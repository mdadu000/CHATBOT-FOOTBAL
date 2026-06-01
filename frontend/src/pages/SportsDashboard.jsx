import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Zap, Users, Globe, Calendar, Dumbbell,
  ArrowRight, Activity, ChevronRight, Star, TrendingUp,
  Moon, Sun, LogOut, UserRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const FEATURES = [
  {
    id: 'live',
    icon: Trophy,
    title: 'Live Sports Hub',
    desc: 'Real-time scores, standings & match results from leagues worldwide',
    color: 'from-amber-500 to-orange-600',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
    badge: 'LIVE',
    href: '/sports/live',
  },
  {
    id: 'quiz',
    icon: Zap,
    title: 'Sports Quiz Arena',
    desc: 'Test your sports knowledge with AI-generated trivia across all disciplines',
    color: 'from-violet-500 to-purple-700',
    glow: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
    badge: 'AI POWERED',
    href: '/sports/quiz',
  },
  {
    id: 'compare',
    icon: Users,
    title: 'Player Comparator',
    desc: 'Side-by-side comparison of any two athletes with detailed stat analysis',
    color: 'from-cyan-500 to-blue-600',
    glow: 'shadow-[0_0_30px_rgba(6,182,212,0.3)]',
    badge: 'ANALYTICS',
    href: '/sports/compare',
  },
  {
    id: 'calendar',
    icon: Calendar,
    title: 'Sports Calendar',
    desc: 'Upcoming tournaments, fixtures & major sporting events worldwide',
    color: 'from-emerald-500 to-teal-600',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    badge: 'SCHEDULE',
    href: '/sports/calendar',
  },
  {
    id: 'fitness',
    icon: Dumbbell,
    title: 'Athlete Fitness Lab',
    desc: 'BMI calculator, position-specific training plans & nutrition tracker',
    color: 'from-rose-500 to-pink-600',
    glow: 'shadow-[0_0_30px_rgba(244,63,94,0.3)]',
    badge: 'TRAINING',
    href: '/sports/fitness',
  },
  {
    id: 'news',
    icon: TrendingUp,
    title: 'Sports News Feed',
    desc: 'Breaking sports headlines, transfer news & match previews curated live',
    color: 'from-lime-500 to-green-600',
    glow: 'shadow-[0_0_30px_rgba(132,204,22,0.3)]',
    badge: 'BREAKING',
    href: '/sports/news',
  },
];

const STATS = [
  { label: 'Sports Covered', value: '50+', icon: Globe },
  { label: 'Leagues Tracked', value: '200+', icon: Trophy },
  { label: 'Players Indexed', value: '10K+', icon: Users },
  { label: 'Live Events', value: '24/7', icon: Activity },
];

export default function SportsDashboard() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [hoveredId, setHoveredId] = useState(null);
  const [ticker, setTicker] = useState(0);

  const TICKERS = [
    '🏆 Liverpool FC won the 2024-25 Premier League',
    '🏏 ICC Champions Trophy 2025 — India vs Pakistan rivalry renewed',
    '🏀 NBA Finals 2025 — Oklahoma City Thunder vs Indiana Pacers',
    '⚽ FIFA Club World Cup 2025 underway in the USA',
    '🎾 French Open 2025 — Sinner leads men\'s draw',
    '🏎️ F1 2025 — Max Verstappen leads championship',
    '🏐 IPL 2025 — Royal Challengers Bengaluru are Champions',
  ];

  useEffect(() => {
    const t = setInterval(() => setTicker(p => (p + 1) % TICKERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f1e] to-slate-950 text-white">
      {/* Animated background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-neon/5 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-0 h-80 w-80 rounded-full bg-violet-500/5 blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl animate-pulse delay-500" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon/10 ring-1 ring-neon/30">
              <Activity className="h-5 w-5 text-neon" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Sportzy</h1>
              <p className="text-[10px] text-slate-400">Sports Intelligence Platform</p>
            </div>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            <Link to="/chat" className="rounded-lg px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5 transition-colors">Chat Bot</Link>
            <Link to="/sports/live" className="rounded-lg px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5 transition-colors">Live</Link>
            <Link to="/sports/quiz" className="rounded-lg px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5 transition-colors">Quiz</Link>
            <Link to="/sports/calendar" className="rounded-lg px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5 transition-colors">Calendar</Link>
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-400 md:block">Hi, {user?.name}</span>
            <button onClick={toggle} className="rounded-lg p-2 hover:bg-white/5 transition-colors">
              {dark ? <Sun className="h-4 w-4 text-slate-300" /> : <Moon className="h-4 w-4 text-slate-300" />}
            </button>
            <Link to="/profile" className="rounded-lg p-2 hover:bg-white/5 transition-colors">
              <UserRound className="h-4 w-4 text-slate-300" />
            </Link>
            <button onClick={logout} className="rounded-lg p-2 hover:bg-white/5 transition-colors">
              <LogOut className="h-4 w-4 text-rose-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Ticker */}
      <div className="border-b border-white/5 bg-neon/5">
        <div className="mx-auto max-w-7xl px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="shrink-0 rounded bg-neon px-2 py-0.5 text-[10px] font-bold text-black">BREAKING</span>
            <AnimatePresence mode="wait">
              <motion.p
                key={ticker}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-xs text-slate-300"
              >
                {TICKERS[ticker]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neon/20 bg-neon/5 px-4 py-1.5 text-xs text-neon">
            <Star className="h-3 w-3" /> AI-Powered Sports Intelligence
          </div>
          <h2 className="mb-3 text-4xl font-extrabold tracking-tight md:text-6xl">
            Your Ultimate{' '}
            <span className="bg-gradient-to-r from-neon to-emerald-400 bg-clip-text text-transparent">
              Sports Hub
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-sm text-slate-400 md:text-base">
            Real-time analytics, AI-powered insights, quiz battles, player comparisons and more — all in one platform.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-2xl bg-neon px-6 py-3 text-sm font-bold text-black shadow-neon hover:brightness-110 transition"
            >
              <Activity className="h-4 w-4" /> Open Sports Bot
            </Link>
            <Link
              to="/sports/live"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Live Scores <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm"
            >
              <s.icon className="mx-auto mb-2 h-5 w-5 text-neon" />
              <div className="text-2xl font-extrabold text-white">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="mb-8">
          <h3 className="mb-6 text-xl font-bold">Explore Features</h3>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onHoverStart={() => setHoveredId(f.id)}
                onHoverEnd={() => setHoveredId(null)}
              >
                <Link to={f.href} className="group block">
                  <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 ${hoveredId === f.id ? f.glow : ''}`}>
                    {/* Badge */}
                    <span className="absolute right-4 top-4 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold tracking-widest text-white/60">
                      {f.badge}
                    </span>

                    {/* Icon */}
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-lg`}>
                      <f.icon className="h-6 w-6 text-white" />
                    </div>

                    <h4 className="mb-2 text-base font-bold text-white group-hover:text-neon transition-colors">
                      {f.title}
                    </h4>
                    <p className="mb-4 text-xs leading-relaxed text-slate-400">{f.desc}</p>

                    <div className="flex items-center gap-1 text-xs font-semibold text-neon">
                      Explore <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>

                    {/* Hover gradient */}
                    <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${f.color} opacity-0 transition-opacity group-hover:opacity-5 rounded-2xl`} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Access Chat Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-neon/20 bg-gradient-to-r from-neon/10 to-emerald-500/5 p-6"
        >
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h4 className="mb-1 text-base font-bold">Ask Sportzy Bot anything</h4>
              <p className="text-xs text-slate-400">Powered by Groq AI + real-time web search. Get live scores, stats, rules and analysis instantly.</p>
            </div>
            <Link
              to="/chat"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-neon px-5 py-2.5 text-sm font-bold text-black shadow-neon hover:brightness-110 transition"
            >
              <Activity className="h-4 w-4" /> Chat Now
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
