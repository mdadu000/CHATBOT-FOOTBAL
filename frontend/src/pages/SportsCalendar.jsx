import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, MapPin, Clock, ChevronRight, Filter } from 'lucide-react';

const EVENTS = [
  // June 2025
  { id: 1, date: '2025-06-01', endDate: '2025-06-08', title: 'French Open — Final Week', sport: '🎾 Tennis', venue: 'Roland Garros, Paris', status: 'live', cat: 'Grand Slam', importance: 'Major' },
  { id: 2, date: '2025-06-03', endDate: '2025-06-03', title: 'IPL 2025 Final', sport: '🏏 Cricket', venue: 'Eden Gardens, Kolkata', status: 'live', cat: 'Tournament Final', importance: 'Major' },
  { id: 3, date: '2025-06-08', endDate: '2025-06-08', title: 'F1 Canadian Grand Prix', sport: '🏎️ Formula 1', venue: 'Circuit Gilles Villeneuve, Montreal', status: 'upcoming', cat: 'Race', importance: 'High' },
  { id: 4, date: '2025-06-14', endDate: '2025-07-14', title: 'FIFA Club World Cup', sport: '⚽ Football', venue: 'USA (Multiple Cities)', status: 'upcoming', cat: 'Tournament', importance: 'Major' },
  { id: 5, date: '2025-06-22', endDate: '2025-06-22', title: 'F1 Austrian Grand Prix', sport: '🏎️ Formula 1', venue: 'Red Bull Ring, Spielberg', status: 'upcoming', cat: 'Race', importance: 'High' },
  { id: 6, date: '2025-06-23', endDate: '2025-07-06', title: 'Wimbledon Championships', sport: '🎾 Tennis', venue: 'All England Club, London', status: 'upcoming', cat: 'Grand Slam', importance: 'Major' },
  // July 2025
  { id: 7, date: '2025-07-05', endDate: '2025-07-06', title: 'Wimbledon Finals', sport: '🎾 Tennis', venue: 'All England Club, London', status: 'upcoming', cat: 'Grand Slam Final', importance: 'Major' },
  { id: 8, date: '2025-07-06', endDate: '2025-07-06', title: 'Tour de France Stage 1', sport: '🚴 Cycling', venue: 'Lille, France', status: 'upcoming', cat: 'Stage Race', importance: 'High' },
  { id: 9, date: '2025-07-12', endDate: '2025-07-12', title: 'F1 British Grand Prix', sport: '🏎️ Formula 1', venue: 'Silverstone Circuit, UK', status: 'upcoming', cat: 'Race', importance: 'High' },
  { id: 10, date: '2025-07-13', endDate: '2025-07-13', title: 'FIFA Club World Cup Final', sport: '⚽ Football', venue: 'MetLife Stadium, New Jersey', status: 'upcoming', cat: 'Tournament Final', importance: 'Major' },
  { id: 11, date: '2025-07-19', endDate: '2025-07-20', title: 'The Open Championship', sport: '⛳ Golf', venue: 'Royal Portrush, N. Ireland', status: 'upcoming', cat: 'Major', importance: 'Major' },
  { id: 12, date: '2025-07-25', endDate: '2025-08-10', title: 'World Athletics Championships', sport: '🏃 Athletics', venue: 'Tokyo, Japan', status: 'upcoming', cat: 'World Championship', importance: 'Major' },
  // August 2025
  { id: 13, date: '2025-08-01', endDate: '2025-08-01', title: 'Premier League Season 2025-26 Kick-off', sport: '⚽ Football', venue: 'Various, England', status: 'upcoming', cat: 'League Start', importance: 'Major' },
  { id: 14, date: '2025-08-18', endDate: '2025-08-31', title: 'US Open Tennis', sport: '🎾 Tennis', venue: 'USTA Billie Jean King Center, NYC', status: 'upcoming', cat: 'Grand Slam', importance: 'Major' },
  { id: 15, date: '2025-09-01', endDate: '2025-09-07', title: 'ICC World Test Championship Final', sport: '🏏 Cricket', venue: 'Lord\'s Cricket Ground, London', status: 'upcoming', cat: 'Championship', importance: 'Major' },
  { id: 16, date: '2025-09-13', endDate: '2025-09-13', title: 'F1 Italian Grand Prix', sport: '🏎️ Formula 1', venue: 'Monza Circuit, Italy', status: 'upcoming', cat: 'Race', importance: 'High' },
  { id: 17, date: '2025-10-01', endDate: '2025-10-31', title: 'NBA 2025-26 Season Opens', sport: '🏀 Basketball', venue: 'USA (Multiple Cities)', status: 'upcoming', cat: 'League Start', importance: 'High' },
  { id: 18, date: '2025-11-22', endDate: '2025-11-22', title: 'F1 Las Vegas Grand Prix', sport: '🏎️ Formula 1', venue: 'Las Vegas Street Circuit', status: 'upcoming', cat: 'Race', importance: 'High' },
  { id: 19, date: '2025-12-07', endDate: '2025-12-07', title: 'FIFA Ballon d\'Or 2025 Ceremony', sport: '⚽ Football', venue: 'Paris, France', status: 'upcoming', cat: 'Award', importance: 'Major' },
  { id: 20, date: '2026-02-01', endDate: '2026-03-31', title: 'ICC Champions Trophy 2026', sport: '🏏 Cricket', venue: 'Pakistan / India', status: 'upcoming', cat: 'Tournament', importance: 'Major' },
  { id: 21, date: '2026-06-11', endDate: '2026-07-19', title: 'FIFA World Cup 2026', sport: '⚽ Football', venue: 'USA / Canada / Mexico', status: 'upcoming', cat: 'World Cup', importance: 'MEGA' },
  { id: 22, date: '2028-07-14', endDate: '2028-07-30', title: 'Los Angeles Olympic Games 2028', sport: '🏅 Olympics', venue: 'Los Angeles, USA', status: 'upcoming', cat: 'Olympics', importance: 'MEGA' },
];

const STATUS_STYLES = {
  live: 'bg-green-500/20 text-green-400 border-green-500/30',
  upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const IMP_COLORS = {
  MEGA: 'bg-gradient-to-r from-amber-500 to-orange-500 text-black',
  Major: 'bg-violet-500/20 text-violet-300',
  High: 'bg-blue-500/20 text-blue-300',
};

const SPORTS_FILTERS = ['All', '⚽ Football', '🏏 Cricket', '🎾 Tennis', '🏎️ Formula 1', '🏀 Basketball', '🏃 Athletics', '⛳ Golf', '🚴 Cycling', '🏅 Olympics'];

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDaysAway(d) {
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
  if (diff < 0) return 'Ended';
  if (diff === 0) return 'Today!';
  if (diff === 1) return 'Tomorrow';
  return `${diff} days`;
}

export default function SportsCalendar() {
  const [filter, setFilter] = useState('All');
  const [showCount, setShowCount] = useState(8);

  const filtered = EVENTS.filter(e => filter === 'All' || e.sport.includes(filter.replace(/^[^ ]+ /, '')));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f1e] to-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/2 left-1/3 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/sports" className="rounded-lg p-1.5 hover:bg-white/5">
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          </Link>
          <Calendar className="h-5 w-5 text-emerald-400" />
          <h1 className="text-base font-bold">Sports Calendar</h1>
          <span className="ml-2 rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] text-green-400">
            {EVENTS.filter(e => e.status === 'live').length} LIVE NOW
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Filter chips */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {SPORTS_FILTERS.map(f => (
            <button key={f} onClick={() => { setFilter(f); setShowCount(8); }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-neon text-black shadow-neon'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >{f}</button>
          ))}
        </div>

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-3 gap-3 md:grid-cols-3">
          {[
            { label: 'Live Events', val: EVENTS.filter(e => e.status === 'live').length, color: 'text-green-400' },
            { label: 'Upcoming', val: EVENTS.filter(e => e.status === 'upcoming').length, color: 'text-blue-400' },
            { label: 'Total Events', val: EVENTS.length, color: 'text-neon' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <div className={`text-xl font-extrabold ${s.color}`}>{s.val}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Events list */}
        <div className="space-y-3">
          {filtered.slice(0, showCount).map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`group rounded-2xl border ${ev.status === 'live' ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-white/5'} p-4 transition-all hover:bg-white/10`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                {/* Date block */}
                <div className="flex shrink-0 items-center gap-3 md:w-36">
                  <div className={`flex flex-col items-center rounded-xl p-2.5 text-center ${ev.status === 'live' ? 'bg-green-500/20' : 'bg-white/10'} min-w-[56px]`}>
                    <span className="text-[10px] text-slate-400">{new Date(ev.date).toLocaleDateString('en', { month: 'short' })}</span>
                    <span className="text-xl font-black text-white">{new Date(ev.date).getDate()}</span>
                    <span className="text-[10px] text-slate-400">{new Date(ev.date).getFullYear()}</span>
                  </div>
                  <div>
                    <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[ev.status]}`}>
                      {ev.status === 'live' && <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />}
                      {ev.status.toUpperCase()}
                    </div>
                    <p className="mt-1 text-[10px] font-bold text-amber-400">{getDaysAway(ev.date)}</p>
                  </div>
                </div>

                {/* Main info */}
                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{ev.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${IMP_COLORS[ev.importance]}`}>{ev.importance}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><span>{ev.sport.split(' ')[0]}</span> {ev.sport.split(' ').slice(1).join(' ')}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {ev.venue}</span>
                    {ev.endDate !== ev.date && (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Until {formatDate(ev.endDate)}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {showCount < filtered.length && (
          <div className="mt-6 text-center">
            <button onClick={() => setShowCount(c => c + 6)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition">
              Load More <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
