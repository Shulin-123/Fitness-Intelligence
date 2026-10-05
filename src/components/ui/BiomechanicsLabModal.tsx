import React, { useState, useEffect } from 'react';
import { Dumbbell, Flame, HeartPulse, X, Zap, CheckCircle2, RefreshCw } from 'lucide-react';
import { BACKEND_URL } from '../../services/springBootApi';

export const BiomechanicsLabModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'1rm' | 'metabolic' | 'longevity'>('1rm');
  const [loading, setLoading] = useState(false);

  // --- 1RM State ---
  const [exercise, setExercise] = useState('Barbell Bench Press');
  const [weightKg, setWeightKg] = useState(82.5);
  const [reps, setReps] = useState(8);
  const [rmResult, setRmResult] = useState<any>(null);

  // --- Metabolic State ---
  const [metWeight, setMetWeight] = useState(74.5);
  const [metHeight, setMetHeight] = useState(178.0);
  const [metAge, setMetAge] = useState(28);
  const [metSex, setMetSex] = useState<'male' | 'female'>('male');
  const [metGoal, setMetGoal] = useState('build_muscle');
  const [metActivity, setMetActivity] = useState('moderate');
  const [metResult, setMetResult] = useState<any>(null);

  // --- Longevity State ---
  const [cardioMinutes, setCardioMinutes] = useState(150);
  const [strengthDays, setStrengthDays] = useState(3);
  const [longevityResult, setLongevityResult] = useState<any>(null);

  // Calculate 1RM
  const calculate1Rm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/engine/estimate-1rm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseName: exercise, weightKg, repsCompleted: reps }),
      });
      if (res.ok) setRmResult(await res.json());
    } catch (err) {
      console.warn('[Lab] 1RM query error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Metabolic
  const calculateMetabolic = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/engine/calculate-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightKg: metWeight,
          heightCm: metHeight,
          age: metAge,
          sex: metSex,
          goal: metGoal,
          activityLevel: metActivity,
        }),
      });
      if (res.ok) setMetResult(await res.json());
    } catch (err) {
      console.warn('[Lab] Metabolic query error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Longevity
  const calculateLongevity = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/engine/longevity-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyCardioMinutes: cardioMinutes, weeklyStrengthSessions: strengthDays }),
      });
      if (res.ok) setLongevityResult(await res.json());
    } catch (err) {
      console.warn('[Lab] Longevity query error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      calculate1Rm();
      calculateMetabolic();
      calculateLongevity();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B1A]/10 border border-[#FF6B1A]/20 flex items-center justify-center text-[#FF6B1A]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                Biomechanics Lab & Science Engine
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Spring Boot Live
                </span>
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Direct interaction with the Java 22 physiological calculation engine
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[var(--border)] px-6 bg-[var(--surface)]">
          <button
            type="button"
            onClick={() => setActiveTab('1rm')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === '1rm'
                ? 'border-[#FF6B1A] text-[#FF6B1A]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            1-Rep Max Biomechanics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('metabolic')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'metabolic'
                ? 'border-[#FF6B1A] text-[#FF6B1A]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Flame className="w-4 h-4" />
            Metabolic & Macro Profiler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('longevity')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'longevity'
                ? 'border-[#FF6B1A] text-[#FF6B1A]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            Longevity & Cardio Simulator
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: 1RM CALCULATOR */}
          {activeTab === '1rm' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    value={exercise}
                    onChange={(e) => setExercise(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] font-medium focus:outline-none focus:border-[#FF6B1A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    Weight Lifted ({weightKg} kg)
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="250"
                    step="2.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                    className="w-full accent-[#FF6B1A] mt-2 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    Reps Completed ({reps} reps)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={reps}
                    onChange={(e) => setReps(parseInt(e.target.value))}
                    className="w-full accent-[#FF6B1A] mt-2 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={calculate1Rm}
                  disabled={loading}
                  className="px-4 py-2 bg-[#FF6B1A] text-[#0F0B09] font-bold text-xs rounded-xl hover:bg-[#FF853E] transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Recalculate via Spring Boot
                </button>
              </div>

              {rmResult && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
                    <p className="text-xs text-[var(--muted)] font-medium">Estimated 1RM</p>
                    <p className="text-3xl font-extrabold text-[#FF6B1A] my-1">
                      {rmResult.recommended1Rm} <span className="text-sm font-normal text-[var(--muted)]">kg</span>
                    </p>
                    <p className="text-[10px] text-[var(--muted)]">
                      Epley: {rmResult.epley1Rm} kg • Brzycki: {rmResult.brzycki1Rm} kg
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] col-span-2 space-y-2">
                    <p className="text-xs font-bold text-[var(--text)]">Auto-Calculated Working Zones</p>
                    {rmResult.trainingZones &&
                      Object.entries(rmResult.trainingZones).map(([zone, weight]) => (
                        <div key={zone} className="flex justify-between items-center text-xs py-1 border-b border-[var(--border)]/50">
                          <span className="text-[var(--muted)]">{zone}</span>
                          <span className="font-mono font-bold text-[var(--text)]">{String(weight)} kg</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: METABOLIC PROFILER */}
          {activeTab === 'metabolic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    Weight ({metWeight} kg)
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="140"
                    step="0.5"
                    value={metWeight}
                    onChange={(e) => setMetWeight(parseFloat(e.target.value))}
                    className="w-full accent-[#FF6B1A] mt-2 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    Height ({metHeight} cm)
                  </label>
                  <input
                    type="range"
                    min="140"
                    max="210"
                    value={metHeight}
                    onChange={(e) => setMetHeight(parseFloat(e.target.value))}
                    className="w-full accent-[#FF6B1A] mt-2 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    Age ({metAge} yo)
                  </label>
                  <input
                    type="range"
                    min="16"
                    max="80"
                    value={metAge}
                    onChange={(e) => setMetAge(parseInt(e.target.value))}
                    className="w-full accent-[#FF6B1A] mt-2 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Biological Sex</label>
                  <select
                    value={metSex}
                    onChange={(e) => setMetSex(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] font-medium focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Target Goal</label>
                  <select
                    value={metGoal}
                    onChange={(e) => setMetGoal(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] font-medium focus:outline-none"
                  >
                    <option value="build_muscle">Build Muscle (+8% surplus)</option>
                    <option value="lose_fat">Lose Fat (-15% deficit)</option>
                    <option value="maintain">Maintain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Activity Multiplier</label>
                  <select
                    value={metActivity}
                    onChange={(e) => setMetActivity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] font-medium focus:outline-none"
                  >
                    <option value="sedentary">Sedentary (1.2x)</option>
                    <option value="light">Lightly Active (1.375x)</option>
                    <option value="moderate">Moderately Active (1.55x)</option>
                    <option value="very_active">Very Active (1.725x)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={calculateMetabolic}
                  disabled={loading}
                  className="px-4 py-2 bg-[#FF6B1A] text-[#0F0B09] font-bold text-xs rounded-xl hover:bg-[#FF853E] transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Recalculate Energy Expenditure
                </button>
              </div>

              {metResult && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                    <p className="text-[11px] text-[var(--muted)]">Basal Metabolic Rate</p>
                    <p className="text-xl font-extrabold text-[var(--text)] mt-1">{metResult.bmr} kcal</p>
                    <p className="text-[9px] text-[var(--muted)]">Mifflin-St Jeor</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                    <p className="text-[11px] text-[var(--muted)]">Maintenance TDEE</p>
                    <p className="text-xl font-extrabold text-[var(--text)] mt-1">{metResult.tdee} kcal</p>
                    <p className="text-[9px] text-[var(--muted)]">PAL Adjusted</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[#FF6B1A]/40 bg-[#FF6B1A]/5">
                    <p className="text-[11px] text-[#FF6B1A] font-bold">Goal Intake</p>
                    <p className="text-xl font-extrabold text-[#FF6B1A] mt-1">{metResult.goalCalories} kcal</p>
                    <p className="text-[9px] text-[var(--muted)]">+8% controlled surplus</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                    <p className="text-[11px] text-[var(--muted)]">Target Protein</p>
                    <p className="text-xl font-extrabold text-emerald-400 mt-1">{metResult.proteinGrams}g</p>
                    <p className="text-[9px] text-[var(--muted)]">ISSN 2.0g/kg</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LONGEVITY SIMULATOR */}
          {activeTab === 'longevity' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    Weekly Zone 2 Cardio ({cardioMinutes} minutes)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="15"
                    value={cardioMinutes}
                    onChange={(e) => setCardioMinutes(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 mt-2 cursor-pointer"
                  />
                  <p className="text-[10px] text-[var(--muted)] mt-1">WHO standard: 150 min/week moderate aerobic</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    Weekly Strength Sessions ({strengthDays} days)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    value={strengthDays}
                    onChange={(e) => setStrengthDays(parseInt(e.target.value))}
                    className="w-full accent-[#FF6B1A] mt-2 cursor-pointer"
                  />
                  <p className="text-[10px] text-[var(--muted)] mt-1">WHO standard: 2+ days/week major muscle groups</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={calculateLongevity}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-500 text-[#0F0B09] font-bold text-xs rounded-xl hover:bg-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Simulate Longevity Impact
                </button>
              </div>

              {longevityResult && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[var(--surface-2)] to-[#FF6B1A]/10 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        WHO Longevity Compliance Score
                      </p>
                      <p className="text-4xl font-extrabold text-[var(--text)] mt-1">
                        {longevityResult.combinedLongevityScore}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#FF6B1A]">
                        Cardiovascular Risk Reduction
                      </p>
                      <p className="text-4xl font-extrabold text-[#FF6B1A] mt-1">
                        -{longevityResult.cardiovascularRiskReductionPct}%
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text)] font-medium leading-relaxed bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)]">
                    {longevityResult.verdict}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Peer-reviewed source: {longevityResult.peerReviewedCitation}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
          <p className="text-[11px] text-[var(--muted)] font-mono">
            Target Host: {BACKEND_URL}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close Lab
          </button>
        </div>
      </div>
    </div>
  );
};
