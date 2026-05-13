import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { LANGUAGES } from '../lib/languages.js';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'en');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPreferredLanguage(user.preferredLanguage || 'en');
    }
  }, [user]);

  async function onSave(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await updateProfile({ name, preferredLanguage });
      toast.success('Profile saved.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  const langOptions = LANGUAGES.filter((l) => l.code !== 'auto');

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link to="/chat" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-neon">
        <ArrowLeft className="h-4 w-4" /> Back to chat
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-8"
      >
        <h1 className="text-2xl font-bold">Profile & settings</h1>
        <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
        <form onSubmit={onSave} className="mt-8 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Name</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none ring-neon/30 focus:ring-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Preferred AI language</label>
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
            className="inline-flex items-center gap-2 rounded-full bg-neon px-5 py-2.5 text-sm font-semibold text-pitch-bg disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
