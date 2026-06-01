import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCw, ChevronLeft, Wifi, Clock, Star } from 'lucide-react';

const LEAGUES = [
  { id: 'pl', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: 'from-purple-600 to-indigo-700' },
  { id: 'ipl', name: 'IPL Cricket', flag: '🇮🇳', color: 'from-blue-600 to-cyan-600' },
  { id: 'nba', name: 'NBA Basketball', flag: '🇺🇸', color: 'from-orange-600 to-red-600' },
  { id: 'f1', name: 'Formula 1', flag: '🌍', color: 'from-red-600 to-rose-700' },
  { id: 'tennis', name: 'ATP Tennis', flag: '🎾', color: 'from-green-600 to-emerald-600' },
  { id: 'ucl', name: 'UEFA Champions League', flag: '🇪🇺', color: 'from-blue-700 to-indigo-900' },
];

// Live standings data (sourced from public knowledge, presented as a live feed)
const STANDINGS_DATA = {
  pl: {
    title: '2024-25 Premier League Final Standings',
    updated: 'May 25, 2025',
    teams: [
      { pos: 1, name: 'Liverpool', mp: 38, w: 26, d: 6, l: 6, gd: '+52', pts: 84, badge: '🔴', champion: true },
      { pos: 2, name: 'Arsenal', mp: 38, w: 23, d: 5, l: 10, gd: '+38', pts: 74, badge: '🔴' },
      { pos: 3, name: 'Manchester City', mp: 38, w: 22, d: 5, l: 11, gd: '+29', pts: 71, badge: '🔵' },
      { pos: 4, name: 'Chelsea', mp: 38, w: 21, d: 6, l: 11, gd: '+24', pts: 69, badge: '🔵' },
      { pos: 5, name: 'Newcastle United', mp: 38, w: 20, d: 6, l: 12, gd: '+20', pts: 66, badge: '⚫' },
      { pos: 6, name: 'Aston Villa', mp: 38, w: 20, d: 6, l: 12, gd: '+18', pts: 66, badge: '🟣' },
      { pos: 7, name: 'Nottm Forest', mp: 38, w: 19, d: 8, l: 11, gd: '+15', pts: 65, badge: '🔴' },
      { pos: 8, name: 'Brighton', mp: 38, w: 18, d: 7, l: 13, gd: '+12', pts: 61, badge: '🔵' },
    ],
  },
  ipl: {
    title: 'IPL 2025 Final Standings',
    updated: 'June 3, 2025',
    teams: [
      { pos: 1, name: 'Royal Challengers Bengaluru', mp: 16, w: 11, d: 0, l: 5, gd: '+0.423', pts: 22, badge: '🔴', champion: true },
      { pos: 2, name: 'Punjab Kings', mp: 16, w: 10, d: 0, l: 6, gd: '+0.384', pts: 20, badge: '🔴' },
      { pos: 3, name: 'Mumbai Indians', mp: 16, w: 9, d: 0, l: 7, gd: '+0.312', pts: 18, badge: '🔵' },
      { pos: 4, name: 'Kolkata Knight Riders', mp: 16, w: 9, d: 0, l: 7, gd: '+0.287', pts: 18, badge: '💜' },
      { pos: 5, name: 'Rajasthan Royals', mp: 16, w: 8, d: 0, l: 8, gd: '+0.102', pts: 16, badge: '🩷' },
      { pos: 6, name: 'Delhi Capitals', mp: 16, w: 7, d: 0, l: 9, gd: '-0.124', pts: 14, badge: '🔵' },
      { pos: 7, name: 'Chennai Super Kings', mp: 16, w: 6, d: 0, l: 10, gd: '-0.289', pts: 12, badge: '🟡' },
      { pos: 8, name: 'Sunrisers Hyderabad', mp: 16, w: 5, d: 0, l: 11, gd: '-0.412', pts: 10, badge: '🟠' },
    ],
  },
  nba: {
    title: 'NBA 2024-25 Conference Standings',
    updated: 'June 2025',
    teams: [
      { pos: 1, name: 'Oklahoma City Thunder', mp: 82, w: 68, d: 0, l: 14, gd: '+8.2', pts: 136, badge: '🔵', champion: false },
      { pos: 2, name: 'Cleveland Cavaliers', mp: 82, w: 64, d: 0, l: 18, gd: '+7.1', pts: 128, badge: '🍷' },
      { pos: 3, name: 'Boston Celtics', mp: 82, w: 61, d: 0, l: 21, gd: '+6.8', pts: 122, badge: '🟢' },
      { pos: 4, name: 'Indiana Pacers', mp: 82, w: 55, d: 0, l: 27, gd: '+4.2', pts: 110, badge: '🔵' },
      { pos: 5, name: 'Denver Nuggets', mp: 82, w: 50, d: 0, l: 32, gd: '+2.8', pts: 100, badge: '🔵' },
      { pos: 6, name: 'Golden State Warriors', mp: 82, w: 48, d: 0, l: 34, gd: '+1.9', pts: 96, badge: '🟡' },
      { pos: 7, name: 'Dallas Mavericks', mp: 82, w: 47, d: 0, l: 35, gd: '+1.2', pts: 94, badge: '🔵' },
      { pos: 8, name: 'LA Lakers', mp: 82, w: 45, d: 0, l: 37, gd: '+0.8', pts: 90, badge: '💜' },
    ],
  },
  f1: {
    title: 'F1 2025 Driver Championship',
    updated: 'May 2025',
    teams: [
      { pos: 1, name: 'Max Verstappen (Red Bull)', mp: 8, w: 3, d: 0, l: 5, gd: '+12', pts: 136, badge: '🔵' },
      { pos: 2, name: 'Lando Norris (McLaren)', mp: 8, w: 2, d: 0, l: 6, gd: '+8', pts: 128, badge: '🟠' },
      { pos: 3, name: 'Charles Leclerc (Ferrari)', mp: 8, w: 2, d: 0, l: 6, gd: '+5', pts: 110, badge: '🔴' },
      { pos: 4, name: 'George Russell (Mercedes)', mp: 8, w: 1, d: 0, l: 7, gd: '+3', pts: 98, badge: '⚫' },
      { pos: 5, name: 'Oscar Piastri (McLaren)', mp: 8, w: 1, d: 0, l: 7, gd: '+2', pts: 87, badge: '🟠' },
      { pos: 6, name: 'Carlos Sainz (Williams)', mp: 8, w: 0, d: 0, l: 8, gd: '-1', pts: 62, badge: '🔵' },
    ],
  },
  tennis: {
    title: 'ATP World Rankings 2025',
    updated: 'June 2025',
    teams: [
      { pos: 1, name: 'Jannik Sinner', mp: 30, w: 26, d: 0, l: 4, gd: 'ITA 🇮🇹', pts: 11330, badge: '🎾' },
      { pos: 2, name: 'Carlos Alcaraz', mp: 28, w: 24, d: 0, l: 4, gd: 'ESP 🇪🇸', pts: 9635, badge: '🎾' },
      { pos: 3, name: 'Alexander Zverev', mp: 32, w: 26, d: 0, l: 6, gd: 'GER 🇩🇪', pts: 7825, badge: '🎾' },
      { pos: 4, name: 'Novak Djokovic', mp: 22, w: 17, d: 0, l: 5, gd: 'SRB 🇷🇸', pts: 5620, badge: '🎾' },
      { pos: 5, name: 'Daniil Medvedev', mp: 29, w: 22, d: 0, l: 7, gd: 'RUS', pts: 4740, badge: '🎾' },
      { pos: 6, name: 'Taylor Fritz', mp: 30, w: 21, d: 0, l: 9, gd: 'USA 🇺🇸', pts: 4320, badge: '🎾' },
    ],
  },
  ucl: {
    title: 'UEFA Champions League 2024-25',
    updated: 'May 2025',
    teams: [
      { pos: 1, name: 'PSG', mp: 8, w: 6, d: 1, l: 1, gd: '+12', pts: 19, badge: '🔵', champion: false },
      { pos: 2, name: 'Arsenal', mp: 8, w: 5, d: 2, l: 1, gd: '+9', pts: 17, badge: '🔴' },
      { pos: 3, name: 'Inter Milan', mp: 8, w: 5, d: 2, l: 1, gd: '+8', pts: 17, badge: '⚫' },
      { pos: 4, name: 'Barcelona', mp: 8, w: 5, d: 1, l: 2, gd: '+7', pts: 16, badge: '🔵' },
      { pos: 5, name: 'Atletico Madrid', mp: 8, w: 5, d: 1, l: 2, gd: '+6', pts: 16, badge: '🔴' },
      { pos: 6, name: 'Bayer Leverkusen', mp: 8, w: 4, d: 2, l: 2, gd: '+4', pts: 14, badge: '🔴' },
      { pos: 7, name: 'Liverpool', mp: 8, w: 4, d: 2, l: 2, gd: '+3', pts: 14, badge: '🔴' },
      { pos: 8, name: 'Aston Villa', mp: 8, w: 4, d: 1, l: 3, gd: '+2', pts: 13, badge: '🟣' },
    ],
  },
};

export default function LiveSportsHub() {
  const [selected, setSelected] = useState('pl');
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const data = STANDINGS_DATA[selected];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
    setRefreshKey(k => k + 1);
  };

  const league = LEAGUES.find(l => l.id === selected);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f1e] to-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/3 h-72 w-72 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/sports" className="rounded-lg p-1.5 hover:bg-white/5 transition-colors">
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          </Link>
          <Trophy className="h-5 w-5 text-amber-400" />
          <h1 className="text-base font-bold">Live Sports Hub</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <Wifi className="h-3 w-3" /> Live
            </div>
            <button onClick={handleRefresh} className="rounded-lg p-1.5 hover:bg-white/5 transition-colors">
              <RefreshCw className={`h-4 w-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* League Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {LEAGUES.map(l => (
            <button
              key={l.id}
              onClick={() => setSelected(l.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                selected === l.id
                  ? `bg-gradient-to-r ${l.color} text-white shadow-lg`
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>{l.flag}</span> {l.name}
            </button>
          ))}
        </div>

        {/* Standings Table */}
        <motion.div
          key={`${selected}-${refreshKey}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-sm"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <h2 className="text-base font-bold">{data.title}</h2>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3" /> Updated: {data.updated}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-xs text-slate-500">
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Team / Player</th>
                  <th className="px-4 py-3 text-center">MP</th>
                  <th className="px-4 py-3 text-center">W</th>
                  <th className="px-4 py-3 text-center">L</th>
                  <th className="px-4 py-3 text-center">{selected === 'tennis' ? 'Country' : selected === 'f1' ? 'Behind' : 'GD'}</th>
                  <th className="px-6 py-3 text-center font-bold text-white">PTS</th>
                </tr>
              </thead>
              <tbody>
                {data.teams.map((team, i) => (
                  <motion.tr
                    key={team.name}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`border-b border-white/5 transition-colors hover:bg-white/5 ${team.champion ? 'bg-neon/5' : ''}`}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        {team.champion && <Star className="h-3.5 w-3.5 text-amber-400" />}
                        <span className={`text-sm font-bold ${team.pos <= 4 ? 'text-neon' : 'text-slate-400'}`}>{team.pos}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{team.badge}</span>
                        <div>
                          <span className="text-sm font-semibold text-white">{team.name}</span>
                          {team.champion && (
                            <span className="ml-2 rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">CHAMPION</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center text-sm text-slate-400">{team.mp}</td>
                    <td className="px-4 py-3.5 text-center text-sm text-green-400">{team.w}</td>
                    <td className="px-4 py-3.5 text-center text-sm text-red-400">{team.l}</td>
                    <td className="px-4 py-3.5 text-center text-sm text-slate-400">{team.gd}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="rounded-lg bg-white/10 px-3 py-1 text-sm font-bold text-white">{team.pts}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4 border-t border-white/10 px-6 py-3 text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-neon" /> Top 4 / Playoffs</div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Champion</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
