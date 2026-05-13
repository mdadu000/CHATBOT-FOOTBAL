import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, Mic, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-full overflow-hidden bg-gradient-to-b from-pitch-bg via-[#0c1018] to-pitch-bg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,255,157,0.12),_transparent_55%)]" />
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16 md:py-24">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-neon" />
            <span className="text-xl font-bold tracking-tight">SportyGenZ</span>
          </div>
          <div className="flex gap-3">
            {isAuthenticated ? (
              <Link
                to="/chat"
                className="rounded-full bg-neon px-5 py-2 text-sm font-semibold text-pitch-bg shadow-neon transition hover:brightness-110"
              >
                Open dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-neon/50"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-neon px-5 py-2 text-sm font-semibold text-pitch-bg shadow-neon"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center"
        >
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neon">
              <Sparkles className="h-3.5 w-3.5" /> Multilingual · Voice · Sports-only
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Your Gen-Z sports co-pilot with{' '}
              <span className="text-neon drop-shadow-[0_0_18px_rgba(0,255,157,0.35)]">real talk</span>{' '}
              and stadium energy.
            </h1>
            <p className="mt-5 max-w-xl text-slate-400">
              Live chat, voice talkback, eight languages, and memories that stick — powered by Gemini, locked to sports
              content so the convo never goes offside.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to={isAuthenticated ? '/chat' : '/signup'}
                className="inline-flex items-center gap-2 rounded-full bg-neon px-6 py-3 text-sm font-semibold text-pitch-bg shadow-neon"
              >
                <Mic className="h-4 w-4" />
                {isAuthenticated ? 'Launch assistant' : 'Create free account'}
              </Link>
              <a
                href="/legacy/"
                className="text-sm text-slate-500 underline-offset-4 hover:text-slate-300 hover:underline"
              >
                Legacy static demo
              </a>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="glass-panel relative rounded-3xl p-6"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-neon/20 blur-2xl" />
            <p className="text-sm font-medium text-neon">Why it hits different</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="text-neon">01</span> JWT auth + MongoDB chat history per account
              </li>
              <li className="flex gap-2">
                <span className="text-neon">02</span> Continuous voice capture + AI speech readout
              </li>
              <li className="flex gap-2">
                <span className="text-neon">03</span> Neon glassmorphism UI tuned for mobile bleachers
              </li>
            </ul>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
