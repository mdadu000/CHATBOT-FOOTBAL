import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronLeft, Trophy, RefreshCw, CheckCircle, XCircle, Star, Timer } from 'lucide-react';

const ALL_QUESTIONS = [
  // Football
  { q: 'How many players are in a football (soccer) team on the field?', opts: ['9', '10', '11', '12'], a: 2, cat: '⚽ Football', diff: 'Easy' },
  { q: 'Which country won the FIFA World Cup 2022?', opts: ['France', 'Brazil', 'Argentina', 'Germany'], a: 2, cat: '⚽ Football', diff: 'Easy' },
  { q: 'Who holds the record for most FIFA World Cup goals scored?', opts: ['Ronaldo', 'Messi', 'Müller', 'Klose'], a: 3, cat: '⚽ Football', diff: 'Hard' },
  { q: 'Which club has won the most UEFA Champions League titles?', opts: ['Barcelona', 'Real Madrid', 'AC Milan', 'Bayern Munich'], a: 1, cat: '⚽ Football', diff: 'Medium' },
  { q: 'Who won the 2024-25 Premier League?', opts: ['Arsenal', 'Man City', 'Liverpool', 'Chelsea'], a: 2, cat: '⚽ Football', diff: 'Easy' },
  // Cricket
  { q: 'How many overs in a standard T20 cricket match per innings?', opts: ['15', '20', '25', '50'], a: 1, cat: '🏏 Cricket', diff: 'Easy' },
  { q: 'Which country has won the most ICC Cricket World Cups?', opts: ['India', 'Australia', 'West Indies', 'England'], a: 1, cat: '🏏 Cricket', diff: 'Medium' },
  { q: 'What is the maximum score from a single delivery in cricket?', opts: ['4', '5', '6', '7'], a: 2, cat: '🏏 Cricket', diff: 'Easy' },
  { q: 'Who holds the record for the highest individual Test score?', opts: ['Lara', 'Tendulkar', 'Hutton', 'Mathews'], a: 0, cat: '🏏 Cricket', diff: 'Hard' },
  { q: 'Which team won IPL 2025?', opts: ['MI', 'CSK', 'RCB', 'KKR'], a: 2, cat: '🏏 Cricket', diff: 'Easy' },
  // Basketball
  { q: 'How high is a standard NBA basketball hoop in feet?', opts: ['8', '9', '10', '11'], a: 2, cat: '🏀 Basketball', diff: 'Easy' },
  { q: 'Who is the NBA all-time leading scorer?', opts: ['Kobe Bryant', 'LeBron James', 'Kareem Abdul-Jabbar', 'Michael Jordan'], a: 1, cat: '🏀 Basketball', diff: 'Medium' },
  { q: 'How many players per team are on the NBA court at one time?', opts: ['4', '5', '6', '7'], a: 1, cat: '🏀 Basketball', diff: 'Easy' },
  // Tennis
  { q: 'How many Grand Slam tournaments are played each year?', opts: ['2', '3', '4', '5'], a: 2, cat: '🎾 Tennis', diff: 'Easy' },
  { q: 'Who has won the most Grand Slam singles titles in tennis history?', opts: ['Federer', 'Nadal', 'Djokovic', 'Sampras'], a: 2, cat: '🎾 Tennis', diff: 'Medium' },
  { q: 'What surface is the French Open played on?', opts: ['Grass', 'Hard', 'Clay', 'Carpet'], a: 2, cat: '🎾 Tennis', diff: 'Easy' },
  // F1
  { q: 'Which team has won the most Formula 1 Constructors Championships?', opts: ['McLaren', 'Ferrari', 'Mercedes', 'Red Bull'], a: 1, cat: '🏎️ Formula 1', diff: 'Hard' },
  { q: 'How many points does an F1 race winner receive?', opts: ['20', '25', '30', '15'], a: 1, cat: '🏎️ Formula 1', diff: 'Easy' },
  { q: 'Who holds the record for most F1 World Championships?', opts: ['Schumacher & Hamilton', 'Senna', 'Verstappen', 'Prost'], a: 0, cat: '🏎️ Formula 1', diff: 'Medium' },
  // General
  { q: 'In which year were the first modern Olympic Games held?', opts: ['1886', '1896', '1906', '1916'], a: 1, cat: '🏅 Olympics', diff: 'Medium' },
  { q: 'How many events are in a decathlon?', opts: ['8', '10', '12', '15'], a: 1, cat: '🏅 Olympics', diff: 'Easy' },
  { q: 'Which sport uses a shuttlecock?', opts: ['Squash', 'Badminton', 'Racquetball', 'Pickleball'], a: 1, cat: '🏸 Misc', diff: 'Easy' },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const DIFF_COLOR = { Easy: 'text-green-400', Medium: 'text-amber-400', Hard: 'text-red-400' };
const TIME_PER_QUESTION = 20;

export default function SportsQuiz() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [done, setDone] = useState(false);
  const [phase, setPhase] = useState('intro'); // intro | playing | done
  const [timer, setTimer] = useState(TIME_PER_QUESTION);
  const [history, setHistory] = useState([]); // {correct: bool}

  const startQuiz = useCallback(() => {
    setQuestions(shuffle(ALL_QUESTIONS).slice(0, 10));
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setHistory([]);
    setTimer(TIME_PER_QUESTION);
    setPhase('playing');
  }, []);

  useEffect(() => {
    if (phase !== 'playing' || selected !== null) return;
    if (timer <= 0) {
      handleAnswer(-1); // time out
      return;
    }
    const t = setTimeout(() => setTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, phase, selected]);

  const handleAnswer = useCallback((idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const q = questions[current];
    const correct = idx === q.a;
    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    setMaxStreak(prev => Math.max(prev, newStreak));
    if (correct) setScore(s => s + (timer > 10 ? 15 : 10));
    setHistory(h => [...h, { correct }]);

    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setPhase('done');
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
        setTimer(TIME_PER_QUESTION);
      }
    }, 1400);
  }, [selected, questions, current, streak, timer]);

  const grade = () => {
    const pct = score / (questions.length * 15);
    if (pct >= 0.9) return { label: '🏆 Champion', color: 'text-amber-400' };
    if (pct >= 0.7) return { label: '⭐ Expert', color: 'text-neon' };
    if (pct >= 0.5) return { label: '📚 Learner', color: 'text-blue-400' };
    return { label: '🌱 Rookie', color: 'text-slate-400' };
  };

  const q = questions[current];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f1e] to-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-violet-500/5 blur-3xl animate-pulse" />
      </div>

      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link to="/sports" className="rounded-lg p-1.5 hover:bg-white/5">
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          </Link>
          <Zap className="h-5 w-5 text-violet-400" />
          <h1 className="text-base font-bold">Sports Quiz Arena</h1>
          {phase === 'playing' && (
            <div className="ml-auto flex items-center gap-3 text-sm">
              <span className="text-neon font-bold">Score: {score}</span>
              {streak > 1 && <span className="text-amber-400 font-bold">🔥 ×{streak}</span>}
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-[0_0_40px_rgba(139,92,246,0.4)]">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-3 text-3xl font-extrabold">Sports Quiz Arena</h2>
              <p className="mb-2 text-slate-400">10 questions · 20 seconds each · Football, Cricket, Tennis, F1 & more</p>
              <p className="mb-8 text-sm text-slate-500">Answer fast for bonus points! Build streaks to multiply your score.</p>
              <div className="mb-8 grid grid-cols-3 gap-4">
                {[['📚', '22 Questions', 'Across 6 sports'], ['⏱️', '20 Seconds', 'Per question'], ['🔥', 'Streaks', 'Bonus multipliers']].map(([icon, title, sub]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-1 text-2xl">{icon}</div>
                    <div className="text-sm font-bold">{title}</div>
                    <div className="text-xs text-slate-400">{sub}</div>
                  </div>
                ))}
              </div>
              <button onClick={startQuiz} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 px-8 py-3.5 text-base font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:brightness-110 transition">
                <Zap className="h-5 w-5" /> Start Quiz
              </button>
            </motion.div>
          )}

          {phase === 'playing' && q && (
            <motion.div key={`q-${current}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              {/* Progress */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Question {current + 1} of {questions.length}</span>
                  <div className="flex items-center gap-1">
                    <Timer className={`h-3.5 w-3.5 ${timer <= 5 ? 'text-red-400' : 'text-slate-400'}`} />
                    <span className={`font-bold ${timer <= 5 ? 'text-red-400' : 'text-white'}`}>{timer}s</span>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
                    animate={{ width: `${((current) / questions.length) * 100}%` }}
                  />
                </div>
                {/* Timer bar */}
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    key={current}
                    className={`h-full rounded-full ${timer <= 5 ? 'bg-red-500' : 'bg-neon'}`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timer / TIME_PER_QUESTION) * 100}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </div>
              </div>

              {/* History dots */}
              <div className="mb-4 flex gap-1.5">
                {history.map((h, i) => (
                  <span key={i} className={`h-2 w-6 rounded-full ${h.correct ? 'bg-neon' : 'bg-red-500'}`} />
                ))}
                {Array.from({ length: questions.length - history.length }).map((_, i) => (
                  <span key={i} className="h-2 w-6 rounded-full bg-white/10" />
                ))}
              </div>

              {/* Category & difficulty */}
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{q.cat}</span>
                <span className={`text-xs font-bold ${DIFF_COLOR[q.diff]}`}>{q.diff}</span>
              </div>

              {/* Question */}
              <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <p className="text-lg font-bold leading-snug text-white">{q.q}</p>
              </div>

              {/* Options */}
              <div className="grid gap-3 sm:grid-cols-2">
                {q.opts.map((opt, i) => {
                  let cls = 'border border-white/10 bg-white/5 text-white hover:bg-white/10';
                  if (selected !== null) {
                    if (i === q.a) cls = 'border-neon bg-neon/20 text-neon';
                    else if (i === selected && selected !== q.a) cls = 'border-red-500 bg-red-500/20 text-red-300';
                    else cls = 'border-white/5 bg-white/5 text-slate-500 opacity-50';
                  }
                  return (
                    <motion.button
                      key={i}
                      whileHover={selected === null ? { scale: 1.02 } : {}}
                      whileTap={selected === null ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswer(i)}
                      disabled={selected !== null}
                      className={`flex items-center gap-3 rounded-xl px-5 py-4 text-left text-sm font-semibold transition-all ${cls}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      {opt}
                      {selected !== null && i === q.a && <CheckCircle className="ml-auto h-4 w-4 text-neon" />}
                      {selected !== null && i === selected && selected !== q.a && <XCircle className="ml-auto h-4 w-4 text-red-400" />}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_60px_rgba(245,158,11,0.4)]">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <h2 className="mb-1 text-3xl font-extrabold">Quiz Complete!</h2>
              <p className={`mb-6 text-xl font-bold ${grade().color}`}>{grade().label}</p>

              <div className="mb-8 grid grid-cols-3 gap-4">
                {[
                  ['Final Score', score, 'pts'],
                  ['Correct', history.filter(h => h.correct).length, `/ ${questions.length}`],
                  ['Best Streak', maxStreak, '🔥'],
                ].map(([label, val, sub]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-2xl font-extrabold text-white">{val}</div>
                    <div className="text-xs text-slate-400">{label}</div>
                    <div className="text-xs text-slate-500">{sub}</div>
                  </div>
                ))}
              </div>

              {/* Answer history */}
              <div className="mb-8 flex justify-center gap-1.5">
                {history.map((h, i) => (
                  <span key={i} className={`h-3 w-8 rounded-full ${h.correct ? 'bg-neon' : 'bg-red-500'}`} title={h.correct ? 'Correct' : 'Wrong'} />
                ))}
              </div>

              <div className="flex justify-center gap-3">
                <button onClick={startQuiz} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-3 text-sm font-bold text-white shadow-lg hover:brightness-110 transition">
                  <RefreshCw className="h-4 w-4" /> Play Again
                </button>
                <Link to="/sports" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition">
                  Back to Hub
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
