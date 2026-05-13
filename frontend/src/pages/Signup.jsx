import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { LANGUAGES } from '../lib/languages.js';

export default function Signup() {
  const { signup, isAuthenticated } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await signup({ name, email, password, preferredLanguage });
      toast.success('Account created — welcome to the squad.');
      nav('/chat', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  const langOptions = LANGUAGES.filter((l) => l.code !== 'auto');

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md rounded-3xl p-8"
      >
        <div className="mb-6 flex items-center gap-2 text-neon">
          <UserPlus className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Sign up</h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Display name</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none ring-neon/30 focus:ring-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none ring-neon/30 focus:ring-2"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Password (8+ chars)</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none ring-neon/30 focus:ring-2"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Preferred language</label>
            <select
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none ring-neon/30 focus:ring-2"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
            >
              {langOptions.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-neon py-3 text-sm font-semibold text-pitch-bg shadow-neon disabled:opacity-50"
          >
            {busy ? 'Creating…' : 'Join the squad'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link className="text-neon hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
