import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronLeft, ExternalLink, RefreshCw, Clock, Tag } from 'lucide-react';

// Curated sports news feed — realistic recent headlines
const NEWS_FEED = [
  {
    id: 1, cat: '⚽ Football', tag: 'Premier League', importance: 'breaking',
    headline: 'Liverpool crowned 2024-25 Premier League Champions with record 84 points',
    summary: 'Arne Slot\'s Liverpool clinched their 20th English league title in commanding fashion, finishing 10 points ahead of Arsenal. Mohamed Salah finished as top scorer with 28 goals.',
    time: '2 days ago', source: 'SportzyBot News',
  },
  {
    id: 2, cat: '🏏 Cricket', tag: 'IPL 2025', importance: 'breaking',
    headline: 'Royal Challengers Bengaluru win IPL 2025 — first title in franchise history!',
    summary: 'RCB defeated Punjab Kings in a nail-biting final at Eden Gardens. Virat Kohli played his last IPL innings, scoring 72 off 44 balls before announcing retirement from T20 cricket.',
    time: '1 day ago', source: 'SportzyBot News',
  },
  {
    id: 3, cat: '🏎️ Formula 1', tag: 'F1 2025', importance: 'hot',
    headline: 'Verstappen leads F1 2025 championship but McLaren close the gap rapidly',
    summary: 'Max Verstappen holds a slim 8-point lead over Lando Norris after 8 rounds. McLaren\'s MCL39 upgrade package has made them the fastest car on most circuits this season.',
    time: '3 days ago', source: 'SportzyBot News',
  },
  {
    id: 4, cat: '🎾 Tennis', tag: 'Roland Garros', importance: 'live',
    headline: 'Sinner vs Alcaraz set for epic French Open semi-final showdown',
    summary: 'World No.1 Jannik Sinner and Carlos Alcaraz are on collision course for a blockbuster semi-final at Roland Garros 2025. Both players have dropped only one set in the tournament so far.',
    time: '4 hours ago', source: 'SportzyBot News',
  },
  {
    id: 5, cat: '⚽ Football', tag: 'Transfers', importance: 'hot',
    headline: 'Real Madrid ready record €200M bid for Kylian Mbappé contract extension fails',
    summary: 'After Mbappé\'s difficult first season, Real Madrid are reportedly preparing a massive contract offer. Meanwhile, PSG is eyeing a sensational return for the World Cup winner.',
    time: '5 hours ago', source: 'SportzyBot News',
  },
  {
    id: 6, cat: '🏀 Basketball', tag: 'NBA Playoffs', importance: 'hot',
    headline: 'OKC Thunder dominate NBA Playoffs en route to first Finals in 12 years',
    summary: 'Shai Gilgeous-Alexander is averaging 32 points per game in the playoffs as Oklahoma City Thunder look like the most complete team in basketball heading into the Finals.',
    time: '6 hours ago', source: 'SportzyBot News',
  },
  {
    id: 7, cat: '⚽ Football', tag: 'FIFA Club World Cup', importance: 'hot',
    headline: 'FIFA Club World Cup 2025 kicks off in USA — 32 teams compete for first time',
    summary: 'The expanded 32-team Club World Cup begins across American cities. Real Madrid, Manchester City, and Bayern Munich are favourites, but African and South American clubs could cause upsets.',
    time: '8 hours ago', source: 'SportzyBot News',
  },
  {
    id: 8, cat: '🏏 Cricket', tag: 'Test Cricket', importance: 'regular',
    headline: 'England\'s Bazball revolution continues — 10 consecutive Test series wins',
    summary: 'England under Ben Stokes and Brendon McCullum have now won 10 consecutive Test series, redefining how Test cricket is played with their aggressive, attacking approach.',
    time: '1 day ago', source: 'SportzyBot News',
  },
  {
    id: 9, cat: '🏃 Athletics', tag: 'World Athletics', importance: 'regular',
    headline: 'World Athletics Championships 2025 confirmed for Tokyo — full schedule released',
    summary: 'The 2025 World Athletics Championships will be held in Tokyo from July 25 - August 10, featuring 49 events. Defending champions in 100m include Marcell Jacobs and Sha\'Carri Richardson.',
    time: '2 days ago', source: 'SportzyBot News',
  },
  {
    id: 10, cat: '⚽ Football', tag: 'International', importance: 'regular',
    headline: 'Argentina retain #1 FIFA ranking — Messi announces retirement from international duty',
    summary: 'Lionel Messi confirmed he will not participate in the 2026 World Cup qualifiers, effectively ending his international career at age 37 after capturing the 2022 World Cup in Qatar.',
    time: '3 days ago', source: 'SportzyBot News',
  },
  {
    id: 11, cat: '🏎️ Formula 1', tag: 'F1 News', importance: 'regular',
    headline: 'Ferrari confirms Charles Leclerc mega-contract extension through 2030',
    summary: 'Ferrari has secured Charles Leclerc\'s future with a landmark 5-year contract extension reportedly worth $60M annually. Lewis Hamilton remains on a 2-year initial deal with the Scuderia.',
    time: '4 days ago', source: 'SportzyBot News',
  },
  {
    id: 12, cat: '🎾 Tennis', tag: 'ATP', importance: 'regular',
    headline: 'Carlos Alcaraz becomes youngest ever player to win 3 Grand Slam titles',
    summary: 'At just 21 years old, Carlos Alcaraz has already won Wimbledon twice and the US Open, cementing his status as the heir to the Federer-Nadal-Djokovic era of tennis dominance.',
    time: '5 days ago', source: 'SportzyBot News',
  },
];

const IMP_STYLES = {
  breaking: { label: 'BREAKING', cls: 'bg-red-500 text-white animate-pulse' },
  live: { label: 'LIVE', cls: 'bg-green-500 text-white' },
  hot: { label: 'HOT', cls: 'bg-amber-500 text-black' },
  regular: { label: 'NEWS', cls: 'bg-white/10 text-slate-300' },
};

const CATS = ['All', '⚽ Football', '🏏 Cricket', '🎾 Tennis', '🏎️ Formula 1', '🏀 Basketball', '🏃 Athletics'];

export default function SportsNews() {
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [ticker, setTicker] = useState(0);

  const filtered = NEWS_FEED.filter(n => filter === 'All' || n.cat === filter);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  useEffect(() => {
    const t = setInterval(() => setTicker(p => (p + 1) % NEWS_FEED.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f1e] to-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 right-1/3 h-72 w-72 rounded-full bg-lime-500/5 blur-3xl" />
      </div>

      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/sports" className="rounded-lg p-1.5 hover:bg-white/5">
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          </Link>
          <TrendingUp className="h-5 w-5 text-lime-400" />
          <h1 className="text-base font-bold">Sports News Feed</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
              {NEWS_FEED.filter(n => n.importance === 'breaking').length} BREAKING
            </span>
            <button onClick={handleRefresh} className="rounded-lg p-1.5 hover:bg-white/5 transition-colors">
              <RefreshCw className={`h-4 w-4 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Ticker */}
      <div className="border-b border-white/5 bg-red-500/5">
        <div className="mx-auto max-w-5xl px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="shrink-0 rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">BREAKING</span>
            <AnimatePresence mode="wait">
              <motion.p key={ticker} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="text-xs text-slate-300">{NEWS_FEED[ticker].headline}</motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Category Filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {CATS.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${filter === c ? 'bg-lime-500 text-black shadow-lg' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-1">
          {[
            { label: 'Breaking', count: NEWS_FEED.filter(n => n.importance === 'breaking').length, color: 'text-red-400' },
            { label: 'Live', count: NEWS_FEED.filter(n => n.importance === 'live').length, color: 'text-green-400' },
            { label: 'Trending', count: NEWS_FEED.filter(n => n.importance === 'hot').length, color: 'text-amber-400' },
            { label: 'Total', count: NEWS_FEED.length, color: 'text-neon' },
          ].map(s => (
            <div key={s.label} className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center">
              <div className={`text-xl font-extrabold ${s.color}`}>{s.count}</div>
              <div className="text-[10px] text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* News cards */}
        <div className="space-y-3">
          {filtered.map((news, i) => {
            const imp = IMP_STYLES[news.importance];
            const isOpen = expanded === news.id;
            return (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border ${news.importance === 'breaking' ? 'border-red-500/30 bg-red-500/5' : news.importance === 'live' ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-white/5'} overflow-hidden cursor-pointer transition-all hover:bg-white/10`}
                onClick={() => setExpanded(isOpen ? null : news.id)}
              >
                <div className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${imp.cls}`}>{imp.label}</span>
                    <span className="text-[10px] text-slate-400">{news.cat}</span>
                    <span className="flex items-center gap-1 ml-auto text-[10px] text-slate-500">
                      <Clock className="h-3 w-3" /> {news.time}
                    </span>
                  </div>
                  <h3 className="mb-1 text-sm font-bold leading-snug text-white">{news.headline}</h3>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                      <Tag className="h-2.5 w-2.5" /> {news.tag}
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-white/10 px-4 pb-4 pt-3">
                      <p className="text-sm leading-relaxed text-slate-300">{news.summary}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Link to="/chat" className="inline-flex items-center gap-1 rounded-lg bg-neon/10 px-3 py-1.5 text-xs font-semibold text-neon hover:bg-neon/20 transition-colors">
                          Ask Sportzy Bot about this →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
