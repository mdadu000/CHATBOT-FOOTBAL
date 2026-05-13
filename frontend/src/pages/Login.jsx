import { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={loc.state?.from || '/chat'} replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success('You are in. Let us cook.');
      nav(loc.state?.from || '/chat', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md rounded-3xl p-8"
      >
        <div className="mb-6 flex items-center gap-2 text-neon">
          <LogIn className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Sign in</h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
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
            <label className="text-xs uppercase tracking-wide text-slate-500">Password</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none ring-neon/30 focus:ring-2"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-neon py-3 text-sm font-semibold text-pitch-bg shadow-neon disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Enter the arena'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{' '}
          <Link className="text-neon hover:underline" to="/signup">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
