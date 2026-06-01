import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, ChevronLeft, Calculator, Target, Apple, CheckCircle, ChevronRight } from 'lucide-react';

const SPORT_PLANS = {
  Football: {
    icon: '⚽', color: 'from-green-600 to-emerald-700',
    positions: ['Goalkeeper', 'Defender', 'Midfielder', 'Winger', 'Striker'],
    workouts: {
      Goalkeeper: ['Reflex drills (cone slalom) — 3×10 reps', 'Box jumps — 4×8 reps', 'Diving saves — 3×6 each side', 'Agility ladder — 4 rounds', 'Core planks — 3×60s', 'Long throws — 3×15 reps'],
      Defender: ['Sprint intervals (30m) — 8 reps', 'Defensive slide tackles — 3×12', 'Header training — 4×10', 'Strength squats — 4×12', 'Aerial duel practice — 3×8', 'Recovery jog — 20 min'],
      Midfielder: ['Long-distance runs — 5 km', 'Passing drill (triangle) — 200 passes', 'Press resistance — 3×8 reps', 'Box-to-box sprints — 6 reps', 'Quick-turn drill — 3×10', 'Yoga/stretch — 20 min'],
      Winger: ['Speed acceleration — 6×30m', '1v1 dribbling — 3×5 min', 'Cross delivery — 4×15', 'Cutback drill — 3×10', 'Plyometric jumps — 3×12', 'Reactive agility — 4 sets'],
      Striker: ['Finishing drill (shooting) — 50 shots', 'Link-up play rondos — 15 min', 'Aerial headers — 4×8', 'First touch control — 3×20', 'Sprint-shoot combo — 8 reps', 'Video analysis — 20 min'],
    },
    nutrition: ['High-carb pre-training meal (pasta/rice)', 'Post-match protein shake (30g whey)', 'Hydrate: 500ml per 30 min of play', 'Electrolyte drink during 90-min sessions', 'Lean protein evening meal (chicken/fish)'],
  },
  Cricket: {
    icon: '🏏', color: 'from-blue-600 to-cyan-700',
    positions: ['Batsman', 'Fast Bowler', 'Spin Bowler', 'Wicket-keeper', 'All-Rounder'],
    workouts: {
      Batsman: ['Shadow batting — 200 shots', 'Throw-down sessions — 100 balls', 'Footwork drills — 4×5 min', 'Pull shot practice — 50 reps', 'Running between wickets — 8×22 yards', 'Core strength — 3×15'],
      'Fast Bowler': ['Bowling run-up — 40 deliveries', 'Hip strengthening — 3×12', 'Wrist flexibility — 5 min', 'Bowling on slope — 20 balls', 'Resistance band shoulder — 3×15', 'Ice bath recovery'],
      'Spin Bowler': ['Finger strength squeeze — 3×30s', 'Spin drill on mat — 60 balls', 'Pivot + release drill — 40 reps', 'Yoga for flexibility — 30 min', 'Flight and drift variations — 30 balls', 'Video review — 15 min'],
      'Wicket-keeper': ['Stump-glove reaction drill — 50 reps', 'Squat hold — 3×45s', 'Take from pacers — 30 balls', 'Lateral jump — 4×10', 'Throwing accuracy — 40 throws', 'Hand-eye drill (ball drops) — 5 min'],
      'All-Rounder': ['Batting net — 45 min', 'Bowling spell — 8 overs', 'Fielding circuit — 3 rounds', 'Endurance run — 4 km', 'Strength circuit — 3×10', 'Recovery stretch — 15 min'],
    },
    nutrition: ['Banana + oats before play', 'Energy bars during innings breaks', 'Protein-rich lunch (lentils/eggs)', 'Coconut water for hydration', 'Anti-inflammatory turmeric milk post-play'],
  },
  Basketball: {
    icon: '🏀', color: 'from-orange-600 to-red-700',
    positions: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
    workouts: {
      'Point Guard': ['Ball handling drills — 15 min', 'Speed dribble + court run — 10 reps', 'Pick-and-roll reads — 20 reps', '3-point shooting — 50 shots', 'Defensive slides — 4×30s', 'Finishing layups — 30 each side'],
      'Shooting Guard': ['Mid-range pull-ups — 60 shots', 'Off-ball movement — 15 min', 'Catch-and-shoot — 50 reps', 'Dribble-pull-up combo — 40 reps', 'Defensive closeouts — 3×10', 'Free throws — 100 shots'],
      'Small Forward': ['Wing scoring drill — 60 shots', 'Post moves — 30 reps', '1v1 isolation — 4×5 min', 'Transition running — 10 reps', 'Defensive rotations — 3 sets', 'Plyometric box jumps — 3×10'],
      'Power Forward': ['Post footwork — 3×10', 'Mid-post jumpers — 40 shots', 'Rebounding box-outs — 3×8', 'Screen-setting drill — 20 reps', 'Strength squats — 4×10', 'Outlet passes — 30 reps'],
      Center: ['Low-post drop steps — 30 reps', 'Hook shots (both hands) — 40 reps', 'Rebounding drills — 3×10', 'Paint defense — 3×8', 'Free throw practice — 80 shots', 'Sprint conditioning — 5×floor length'],
    },
    nutrition: ['Pre-game: light pasta + banana (3h before)', 'Halftime: orange slices + water', 'Post-game: chocolate milk (recovery)', 'Protein shake + creatine post-training', 'Hydrate: 250ml every 20 min of play'],
  },
  Tennis: {
    icon: '🎾', color: 'from-lime-600 to-green-700',
    positions: ['Baseline Player', 'Serve-and-Volley', 'All-Court Player', 'Defensive Retriever'],
    workouts: {
      'Baseline Player': ['Forehand cross-court — 200 balls', 'Backhand inside-out — 150 balls', 'Rally consistency — 30 min', 'Lateral movement drill — 4×10', 'Footwork ladder — 3 rounds', 'Serve practice — 100 balls'],
      'Serve-and-Volley': ['Serve-volley point plays — 50 reps', 'First volley drill — 60 balls', 'Net approaches — 40 reps', 'Overhead smash — 30 balls', 'Footwork to net — 3×8', 'Wide serve + volley — 40 reps'],
      'All-Court Player': ['Baseline to net transitions — 30 reps', 'Drop shot practice — 40 balls', 'High backhand slice — 60 balls', 'Serve variations — 80 balls', 'On-court fitness run — 3 km', 'Match simulation — 45 min'],
      'Defensive Retriever': ['Running forehand drill — 5×5 min', 'Lob accuracy — 40 balls', 'Sliding footwork — 3×12', 'Counter-punch drills — 30 min', 'Sprint recovery — 10 reps', 'Core stability — 3×45s'],
    },
    nutrition: ['Pre-match: banana + oat bar 90 min before', 'During match: isotonic drink per set', 'Post-match: whey protein + fruit smoothie', 'Avoid heavy meals within 2h of play', 'Magnesium supplement to prevent cramps'],
  },
};

function BMICalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('metric');
  const [result, setResult] = useState(null);

  const calc = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return;
    let bmi;
    if (unit === 'metric') {
      bmi = w / ((h / 100) ** 2);
    } else {
      bmi = (703 * w) / (h ** 2);
    }
    let cat, color, advice;
    if (bmi < 18.5) { cat = 'Underweight'; color = 'text-blue-400'; advice = 'Increase calorie intake with nutrient-dense foods. Focus on strength training to build muscle mass.'; }
    else if (bmi < 25) { cat = 'Healthy Weight'; color = 'text-neon'; advice = 'Great shape for most sports! Focus on sport-specific conditioning and maintain balanced nutrition.'; }
    else if (bmi < 30) { cat = 'Overweight'; color = 'text-amber-400'; advice = 'Incorporate cardio 4× per week. Reduce processed foods and increase protein intake for body recomposition.'; }
    else { cat = 'Obese'; color = 'text-red-400'; advice = 'Consult a sports physician. Begin with low-impact cardio (swimming, cycling). Nutrition overhaul is key.'; }
    setResult({ bmi: bmi.toFixed(1), cat, color, advice });
  };

  const pct = result ? Math.min(((parseFloat(result.bmi) - 10) / 30) * 100, 100) : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-rose-400" />
        <h3 className="text-base font-bold">Athlete BMI Calculator</h3>
      </div>

      <div className="mb-4 flex rounded-xl border border-white/10 p-1">
        {['metric', 'imperial'].map(u => (
          <button key={u} onClick={() => { setUnit(u); setResult(null); }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${unit === u ? 'bg-neon text-black' : 'text-slate-400'}`}>
            {u === 'metric' ? 'Metric (cm/kg)' : 'Imperial (in/lbs)'}
          </button>
        ))}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-slate-400">Height ({unit === 'metric' ? 'cm' : 'inches'})</label>
          <input value={height} onChange={e => setHeight(e.target.value)} type="number" placeholder={unit === 'metric' ? '175' : '69'}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-rose-500/50 transition" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
          <input value={weight} onChange={e => setWeight(e.target.value)} type="number" placeholder={unit === 'metric' ? '75' : '165'}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-rose-500/50 transition" />
        </div>
      </div>
      <button onClick={calc} className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 py-2.5 text-sm font-bold text-white hover:brightness-110 transition">
        Calculate BMI
      </button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-2xl font-extrabold text-white">{result.bmi}</p>
                <p className={`text-sm font-bold ${result.color}`}>{result.cat}</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-neon/30 bg-neon/10">
                <span className={`text-lg font-black ${result.color}`}>{result.bmi}</span>
              </div>
            </div>
            {/* BMI scale bar */}
            <div className="mb-3 h-3 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-neon via-amber-400 to-red-500">
              <div className="relative h-full">
                <div className="absolute top-0 h-full w-0.5 bg-white shadow-lg transition-all" style={{ left: `${pct}%` }} />
              </div>
            </div>
            <div className="mb-3 flex justify-between text-[9px] text-slate-500">
              <span>Underweight &lt;18.5</span><span>Normal 18.5-25</span><span>Overweight 25-30</span><span>Obese &gt;30</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
              <p className="mb-1 font-semibold text-white">Sports Advice:</p>
              {result.advice}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FitnessLab() {
  const [sport, setSport] = useState('Football');
  const [position, setPosition] = useState('Striker');
  const [tab, setTab] = useState('workout');

  const plan = SPORT_PLANS[sport];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f1e] to-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute bottom-1/3 right-1/4 h-80 w-80 rounded-full bg-rose-500/5 blur-3xl" />
      </div>

      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/sports" className="rounded-lg p-1.5 hover:bg-white/5">
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          </Link>
          <Dumbbell className="h-5 w-5 text-rose-400" />
          <h1 className="text-base font-bold">Athlete Fitness Lab</h1>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Training Plan */}
          <div>
            <h2 className="mb-4 text-lg font-bold">Training Plan Generator</h2>

            {/* Sport selector */}
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(SPORT_PLANS).map(([s, d]) => (
                <button key={s} onClick={() => { setSport(s); setPosition(d.positions[0]); }}
                  className={`flex flex-col items-center gap-1 rounded-xl p-3 text-xs font-semibold transition-all ${sport === s ? `bg-gradient-to-br ${d.color} text-white shadow-lg` : 'border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                  <span className="text-xl">{d.icon}</span> {s}
                </button>
              ))}
            </div>

            {/* Position selector */}
            <div className="mb-4">
              <p className="mb-2 text-xs text-slate-400">Select Position</p>
              <div className="flex flex-wrap gap-2">
                {plan.positions.map(p => (
                  <button key={p} onClick={() => setPosition(p)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${position === p ? 'bg-neon text-black shadow-neon' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex rounded-xl border border-white/10 p-1">
              {[['workout', '💪 Workout'], ['nutrition', '🥗 Nutrition']].map(([t, l]) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${tab === t ? 'bg-neon text-black' : 'text-slate-400'}`}>
                  {l}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={`${sport}-${position}-${tab}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                {tab === 'workout' ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-neon" />
                      <p className="text-sm font-bold">{sport} — {position} Daily Plan</p>
                    </div>
                    <div className="space-y-2.5">
                      {(plan.workouts[position] || []).map((ex, i) => (
                        <motion.div key={ex} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                          className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-2.5">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon/10 text-xs font-bold text-neon">{i + 1}</div>
                          <p className="text-sm text-slate-200">{ex}</p>
                          <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-white/10" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Apple className="h-4 w-4 text-green-400" />
                      <p className="text-sm font-bold">Nutrition Guidelines — {sport}</p>
                    </div>
                    <div className="space-y-2.5">
                      {plan.nutrition.map((tip, i) => (
                        <motion.div key={tip} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                          className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-2.5">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xs font-bold text-green-400">{i + 1}</div>
                          <p className="text-sm text-slate-200">{tip}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: BMI Calculator */}
          <div>
            <h2 className="mb-4 text-lg font-bold">Body Metrics</h2>
            <BMICalculator />

            {/* Quick stats */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="mb-3 text-sm font-bold text-white">Elite Athlete BMI Benchmarks</h3>
              <div className="space-y-2">
                {[
                  ['Football Striker', '20-23'],
                  ['Marathon Runner', '18-20'],
                  ['NBA Player (Forward)', '24-27'],
                  ['Rugby Prop', '28-32'],
                  ['Olympic Sprinter', '21-24'],
                  ['Gymnast', '18-21'],
                ].map(([role, range]) => (
                  <div key={role} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{role}</span>
                    <span className="rounded bg-neon/10 px-2 py-0.5 font-bold text-neon">{range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
