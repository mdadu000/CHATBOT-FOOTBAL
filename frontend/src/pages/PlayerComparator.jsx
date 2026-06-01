import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronLeft, Search, BarChart3, TrendingUp, Award } from 'lucide-react';

const PLAYERS_DB = {
  'Cristiano Ronaldo': {
    sport: 'Football', flag: '🇵🇹', position: 'Forward', age: 40, club: 'Al Nassr',
    img: '⚽', color: 'from-blue-600 to-indigo-700',
    stats: { Goals: 920, Assists: 230, 'Apps': 1100, 'Int\'l Goals': 137, Speed: 94, Dribbling: 88, Finishing: 97, Strength: 91 },
    achievements: ['5× Ballon d\'Or', '5× UCL Winner', '3× PL Winner', '2× La Liga'],
  },
  'Lionel Messi': {
    sport: 'Football', flag: '🇦🇷', position: 'Forward', age: 37, club: 'Inter Miami',
    img: '⚽', color: 'from-sky-500 to-blue-600',
    stats: { Goals: 855, Assists: 380, 'Apps': 1050, 'Int\'l Goals': 112, Speed: 88, Dribbling: 99, Finishing: 95, Strength: 72 },
    achievements: ['8× Ballon d\'Or', 'FIFA World Cup 2022', '4× UCL', '10× La Liga'],
  },
  'Virat Kohli': {
    sport: 'Cricket', flag: '🇮🇳', position: 'Batsman', age: 36, club: 'India / RCB',
    img: '🏏', color: 'from-blue-700 to-cyan-600',
    stats: { 'Test Runs': 9230, 'ODI Runs': 14058, 'T20 Runs': 4188, Centuries: 82, 'Test Avg': 46.85, 'ODI Avg': 58.07, 'Strike Rate': 139, Catches: 194 },
    achievements: ['ICC Player of Decade', 'ICC World Test Championship', '4× IPL Finalist', '51 ODI Centuries'],
  },
  'MS Dhoni': {
    sport: 'Cricket', flag: '🇮🇳', position: 'Wicket-keeper', age: 43, club: 'CSK (retired)',
    img: '🏏', color: 'from-yellow-600 to-amber-600',
    stats: { 'Test Runs': 4876, 'ODI Runs': 10773, 'T20 Runs': 1617, Centuries: 16, 'Test Avg': 38.09, 'ODI Avg': 50.57, 'Strike Rate': 126, Stumpings: 195 },
    achievements: ['2× T20 World Cup', 'ICC World Cup 2011', 'ICC Champions Trophy', '5× IPL Champion (CSK)'],
  },
  'LeBron James': {
    sport: 'Basketball', flag: '🇺🇸', position: 'Small Forward', age: 40, club: 'LA Lakers',
    img: '🏀', color: 'from-purple-600 to-yellow-600',
    stats: { Points: 40388, Assists: 11038, Rebounds: 11190, 'PPG': 27.2, 'APG': 7.4, 'RPG': 7.5, Steals: 2347, Blocks: 1313 },
    achievements: ['4× NBA Champion', '4× Finals MVP', '21× All-Star', 'All-Time Scorer'],
  },
  'Novak Djokovic': {
    sport: 'Tennis', flag: '🇷🇸', position: 'Baseline', age: 37, club: 'ATP Tour',
    img: '🎾', color: 'from-red-600 to-orange-600',
    stats: { 'Grand Slams': 24, 'Titles': 98, 'Win %': 83.3, 'Weeks #1': 428, 'Aces/Match': 8.2, 'Serve %': 66, 'Break Points Saved %': 65, 'Finals': 134 },
    achievements: ['Most Grand Slams (24)', 'Career Golden Slam', '428 Weeks World #1', '7× Wimbledon'],
  },
  'Max Verstappen': {
    sport: 'Formula 1', flag: '🇳🇱', position: 'Driver', age: 27, club: 'Red Bull Racing',
    img: '🏎️', color: 'from-blue-700 to-red-600',
    stats: { 'Race Wins': 64, 'Pole Positions': 42, Podiums: 108, Points: 3320, Championships: 4, 'Fastest Laps': 32, 'Laps Led': 9250, 'DNFs': 18 },
    achievements: ['4× F1 World Champion', 'Most Wins in a Season (19)', 'Most Points in a Season', 'Youngest Champion'],
  },
  'Usain Bolt': {
    sport: 'Athletics', flag: '🇯🇲', position: 'Sprinter', age: 38, club: 'Retired',
    img: '⚡', color: 'from-yellow-500 to-amber-600',
    stats: { '100m': 9.58, '200m': 19.19, 'Gold Medals': 8, 'World Records': 3, 'Olympics': 3, 'World Champs': 9, 'Reaction Time': 0.165, 'Top Speed (km/h)': 44.72 },
    achievements: ['8× Olympic Gold', '3× World Records', '100m WR: 9.58s', '200m WR: 19.19s'],
  },
};

const STAT_COLORS = ['bg-neon/20 text-neon', 'bg-violet-500/20 text-violet-400', 'bg-blue-500/20 text-blue-400', 'bg-amber-500/20 text-amber-400'];

function StatBar({ label, val, maxVal, color }) {
  const pct = Math.min((Number(val) / maxVal) * 100, 100);
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-white">{val}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function PlayerCard({ name, data, side }) {
  if (!data) return (
    <div className="flex h-96 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 text-slate-500">
      <div className="text-center">
        <Users className="mx-auto mb-2 h-10 w-10 opacity-30" />
        <p className="text-sm">Select a player</p>
      </div>
    </div>
  );

  const statEntries = Object.entries(data.stats);
  const numericStats = statEntries.filter(([, v]) => typeof v === 'number');
  const maxNumeric = Math.max(...numericStats.map(([, v]) => v));

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-2xl border border-white/10 bg-gradient-to-br ${data.color} p-0.5`}
    >
      <div className="rounded-2xl bg-slate-950/90 p-5">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${data.color} text-3xl shadow-lg`}>
            {data.img}
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">{name}</h3>
            <p className="text-xs text-slate-400">{data.flag} {data.position} · {data.club}</p>
            <div className="mt-1 flex gap-1.5">
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">{data.sport}</span>
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">Age {data.age}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Career Stats</p>
          {statEntries.slice(0, 6).map(([k, v], i) => (
            <StatBar key={k} label={k} val={v} maxVal={maxNumeric} color={STAT_COLORS[i % STAT_COLORS.length].split(' ')[0].replace('/20', '/60')} />
          ))}
        </div>

        {/* Achievements */}
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Major Achievements</p>
          <div className="space-y-1">
            {data.achievements.map(a => (
              <div key={a} className="flex items-center gap-2 text-xs text-slate-300">
                <Award className="h-3 w-3 shrink-0 text-amber-400" />
                {a}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function PlayerComparator() {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');

  const filtered1 = Object.keys(PLAYERS_DB).filter(n => n.toLowerCase().includes(search1.toLowerCase()) && n !== p2);
  const filtered2 = Object.keys(PLAYERS_DB).filter(n => n.toLowerCase().includes(search2.toLowerCase()) && n !== p1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f1e] to-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/3 left-0 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/sports" className="rounded-lg p-1.5 hover:bg-white/5">
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          </Link>
          <Users className="h-5 w-5 text-cyan-400" />
          <h1 className="text-base font-bold">Player Comparator</h1>
          <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-400">{Object.keys(PLAYERS_DB).length} athletes indexed</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Search Row */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          {[
            { label: 'Player 1', search: search1, setSearch: setSearch1, player: p1, setPlayer: setP1, filtered: filtered1 },
            { label: 'Player 2', search: search2, setSearch: setSearch2, player: p2, setPlayer: setP2, filtered: filtered2 },
          ].map(({ label, search, setSearch, player, setPlayer, filtered }) => (
            <div key={label}>
              <p className="mb-2 text-xs font-bold text-slate-400">{label}</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={player || search}
                  onChange={e => { setSearch(e.target.value); if (player) setPlayer(''); }}
                  placeholder="Search athlete..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition"
                />
                {search && !player && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
                    {filtered.slice(0, 6).map(n => (
                      <button key={n} onClick={() => { setPlayer(n); setSearch(''); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors">
                        <span className="text-lg">{PLAYERS_DB[n].img}</span>
                        <div className="text-left">
                          <div className="font-semibold text-white">{n}</div>
                          <div className="text-xs text-slate-500">{PLAYERS_DB[n].sport} · {PLAYERS_DB[n].flag}</div>
                        </div>
                      </button>
                    ))}
                    {filtered.length === 0 && <p className="px-4 py-3 text-xs text-slate-500">No athletes found</p>}
                  </div>
                )}
              </div>
              {player && (
                <button onClick={() => { setPlayer(''); }} className="mt-1 text-[10px] text-slate-500 hover:text-red-400 transition-colors">
                  ✕ Clear
                </button>
              )}
            </div>
          ))}
        </div>

        {/* VS Banner */}
        {p1 && p2 && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 text-center">
            <div className="inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-8 py-3">
              <span className="text-sm font-bold text-white">{p1}</span>
              <span className="rounded-full bg-neon px-3 py-1 text-sm font-black text-black">VS</span>
              <span className="text-sm font-bold text-white">{p2}</span>
            </div>
          </motion.div>
        )}

        {/* Cards */}
        <div className="grid gap-5 md:grid-cols-2">
          <PlayerCard name={p1} data={PLAYERS_DB[p1]} side="left" />
          <PlayerCard name={p2} data={PLAYERS_DB[p2]} side="right" />
        </div>

        {/* Quick Select */}
        {!p1 && !p2 && (
          <div className="mt-8">
            <p className="mb-3 text-xs font-bold text-slate-500">POPULAR ATHLETES</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PLAYERS_DB).map(([name, d]) => (
                <button key={name} onClick={() => { if (!p1) setP1(name); else if (!p2 && name !== p1) setP2(name); }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all">
                  <span>{d.img}</span> {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
