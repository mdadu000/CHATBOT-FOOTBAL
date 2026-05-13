import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, Mic, Sparkles, Trophy, Zap, Globe, ArrowRight, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="relative min-h-full overflow-x-hidden bg-gradient-to-b from-pitch-bg via-[#0b0e14] to-pitch-bg text-slate-100 font-display">
      {/* Premium ambient backdrop gradients */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_top,_rgba(0,255,157,0.15),_transparent_65%)] z-0" />
      <div className="pointer-events-none absolute top-1/3 -left-48 w-96 h-96 bg-neon/5 blur-[120px] rounded-full z-0" />
      <div className="pointer-events-none absolute bottom-10 -right-48 w-96 h-96 bg-neon/5 blur-[120px] rounded-full z-0" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col min-h-screen px-6 py-8 justify-between">
        {/* Top Navigation Header */}
        <header className="flex items-center justify-between gap-4 border-b border-white/5 pb-6">
          <Link to="/" id="brand-logo-link" className="flex items-center gap-2 group">
            <div className="relative p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-neon/40 transition">
              <Bot className="h-7 w-7 text-neon drop-shadow-[0_0_12px_rgba(0,255,157,0.4)]" />
              <div className="absolute inset-0 rounded-xl bg-neon/10 blur-sm opacity-0 group-hover:opacity-100 transition" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-neon bg-clip-text text-transparent">
              Sportzy Bot
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/chat"
                id="header-nav-dashboard-btn"
                className="rounded-full bg-neon px-6 py-2.5 text-sm font-bold text-pitch-bg shadow-neon transition-all hover:scale-105 hover:brightness-110 duration-200"
              >
                Go to Arena
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  id="header-nav-signin-btn"
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-slate-300 backdrop-blur-md transition hover:border-neon/40 hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  id="header-nav-signup-btn"
                  className="rounded-full bg-neon px-5 py-2 text-sm font-bold text-pitch-bg shadow-neon transition-all hover:scale-105 hover:brightness-110 duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Main Hero Section */}
        <main className="flex-1 flex flex-col justify-center my-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center max-w-4xl mx-auto"
          >
            {/* Pulsing visual tag */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/5 px-4 py-1.5 text-xs font-semibold text-neon backdrop-blur-md mb-8 shadow-[0_0_15px_rgba(0,255,157,0.1)]"
            >
              <span className="flex h-2 w-2 rounded-full bg-neon animate-pulse" />
              <Sparkles className="h-3.5 w-3.5" /> Next-Gen AI Football & Sports Specialist
            </motion.div>

            {/* Premium Header Typography */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.1] max-w-3xl"
            >
              Unleash the ultimate{' '}
              <span className="relative whitespace-nowrap">
                <span className="relative bg-gradient-to-r from-neon via-[#a3ffdc] to-neon bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,255,157,0.4)] font-black">
                  Sportzy Bot
                </span>
              </span>{' '}
              experience.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed"
            >
              Command pure football stats, tactical breakdown readouts, and global multi-language commentary powered by advanced AI. Zero generic filler—just raw stadium energy.
            </motion.p>

            {/* Dynamic CTAs */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
            >
              <Link
                to={isAuthenticated ? '/chat' : '/signup'}
                id="hero-main-cta-btn"
                className="group relative inline-flex items-center gap-3 rounded-full bg-neon px-8 py-4 text-base font-bold text-pitch-bg shadow-neon transition-all hover:scale-105 duration-200 overflow-hidden w-full sm:w-auto justify-center"
              >
                <Mic className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span>{isAuthenticated ? 'Enter Chat Arena' : 'Start Talking for Free'}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/login"
                id="hero-secondary-cta-btn"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-pitch-glass px-8 py-4 text-base font-medium text-slate-300 backdrop-blur-xl transition hover:border-white/20 hover:text-white w-full sm:w-auto"
              >
                Member Portal
              </Link>
            </motion.div>

            {/* Floating Quick Stats Cards */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-16 max-w-3xl"
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="glass-panel rounded-2xl p-4 flex flex-col items-center text-center border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition"
              >
                <div className="p-2 rounded-lg bg-neon/10 text-neon mb-2">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="text-xl font-bold text-white">Ultra-Fast</div>
                <div className="text-xs text-slate-400 mt-0.5">Real-time dynamic voice & replies</div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="glass-panel rounded-2xl p-4 flex flex-col items-center text-center border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition"
              >
                <div className="p-2 rounded-lg bg-neon/10 text-neon mb-2">
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="text-xl font-bold text-white">Sports Only</div>
                <div className="text-xs text-slate-400 mt-0.5">Tactically locked context logic</div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="glass-panel rounded-2xl p-4 flex flex-col items-center text-center border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition"
              >
                <div className="p-2 rounded-lg bg-neon/10 text-neon mb-2">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="text-xl font-bold text-white">8 Languages</div>
                <div className="text-xs text-slate-400 mt-0.5">Native multi-tongue voice engines</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </main>

        {/* Footer section */}
        <footer className="mt-auto border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-neon" />
            <span>© {new Date().getFullYear()} Sportzy Bot. Powered by advanced custom Gen-Z sports AI models.</span>
          </div>
          <div>
            <a
              href="/legacy/"
              id="footer-legacy-demo-link"
              className="underline-offset-4 hover:text-neon transition hover:underline"
            >
              View Legacy Static Interface
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

