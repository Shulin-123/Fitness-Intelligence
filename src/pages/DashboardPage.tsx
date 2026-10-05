import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Dumbbell,
  TrendingDown,
  Sparkles,
  Plus,
  Play,
  Activity,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Ring } from '../components/ui/Ring';
import { Button } from '../components/ui/Button';
import { ReadinessCheckin } from '../components/ui/ReadinessCheckin';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useWhyDrawer } from '../context/WhyDrawerContext';
import { useToast } from '../context/ToastContext';
import { services, type AssessmentResult } from '../services/registry';
import { calculateStreak } from '../engine/rules';
import { calculateGuidelineProgress, type GuidelineProgressResult } from '../engine/guidelineProgress';
import type {
  UserProfile,
  WeeklyPlan,
  WorkoutDay,
  DailyNutritionLog,
  WeightLogEntry,
  ReadinessCheckinData,
  WeeklyReviewReport,
} from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { openDrawer } = useWhyDrawer();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<WorkoutDay | null>(null);
  const [todayNutrition, setTodayNutrition] = useState<DailyNutritionLog | null>(null);
  const [weights, setWeights] = useState<WeightLogEntry[]>([]);
  const [readiness, setReadiness] = useState<ReadinessCheckinData | null>(null);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReviewReport | null>(null);
  const [guidelineProgress, setGuidelineProgress] = useState<GuidelineProgressResult | null>(null);

  const [quickWeight, setQuickWeight] = useState<string>('');
  const [showWeightModal, setShowWeightModal] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await services.profile.getProfile();
      if (!p) {
        navigate('/onboarding');
        return;
      }
      setProfile(p);

      const assess = services.assessment.calculateAssessment(p);
      setAssessment(assess);

      // Load or generate plan if not red
      if (assess.safety.tier !== 'red') {
        let currentPlan = await services.plan.getWeeklyPlan();
        if (!currentPlan) {
          currentPlan = await services.plan.generateAndSavePlan(p);
        }
        setPlan(currentPlan);
        if (currentPlan) {
          const workout = await services.workout.getTodayWorkout(currentPlan);
          setTodayWorkout(workout);
        }
      }

      // Load nutrition & water
      const nut = await services.food.getDailyLog(todayStr);
      setTodayNutrition(nut);

      // Load weights
      const wList = await services.weight.getWeightHistory();
      setWeights(wList);

      // Load readiness
      const r = await services.readiness.getLatestReadiness(todayStr);
      setReadiness(r);

      // Load or generate weekly review
      const rev = await services.weeklyReview.generateCurrentReview();
      setWeeklyReview(rev);

      // Compute public-health guideline progress (150 min active, 2+ days strength)
      const wHistory = await services.workout.getWorkoutHistory();
      const gProgress = calculateGuidelineProgress(wHistory, todayStr);
      setGuidelineProgress(gProgress);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleReadinessSubmit = async (sleep: number, soreness: number, energy: number) => {
    const newCheckin = await services.readiness.submitReadiness(sleep, soreness, energy, todayStr);
    setReadiness(newCheckin);
    showToast(`Readiness logged: ${newCheckin.calculatedScore}/100. Today's workout volume adjusted.`, 'success');
  };

  const handleAddWater = async (amountMl: number) => {
    const updated = await services.water.addWater(amountMl, todayStr);
    if (todayNutrition) {
      setTodayNutrition({ ...todayNutrition, waterMl: updated });
    }
    showToast(`Added +${amountMl} ml water.`, 'info');
  };

  const handleQuickWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(quickWeight);
    if (val > 30 && val < 300) {
      await services.weight.logWeight(val, todayStr);
      setQuickWeight('');
      setShowWeightModal(false);
      showToast(`Weigh-in recorded: ${val} kg.`, 'success');
      loadDashboardData();
    }
  };

  const handleAcceptReview = async () => {
    if (!weeklyReview || !profile) return;
    await services.weeklyReview.acceptReviewAdjustment(weeklyReview.id);

    // If there is an adjustment, adjust profile calories or target
    const currentTarget = assessment?.goalCalories.value || 2000;
    const newTarget = currentTarget + weeklyReview.suggestedAdjustmentKcal;

    setWeeklyReview({ ...weeklyReview, accepted: true });
    showToast(`Calorie target adapted to ${newTarget} kcal.`, 'success');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !profile || !assessment) {
    return (
      <div className="py-12">
        <ErrorState
          title="Dashboard unavailable"
          message={error || 'Failed to initialize session'}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  const isRed = assessment.safety.tier === 'red';
  const targetCalories = assessment.goalCalories.value;
  const currentCalories = todayNutrition?.totalCalories || 0;
  const currentWater = todayNutrition?.waterMl || 0;
  const targetWater = assessment.waterTarget.value;

  const currentProtein = todayNutrition?.totalProteinGrams || 0;
  const targetProtein = assessment.macros.value.proteinGrams;

  const currentCarbs = todayNutrition?.totalCarbGrams || 0;
  const targetCarbs = assessment.macros.value.carbGrams;

  const currentFat = todayNutrition?.totalFatGrams || 0;
  const targetFat = assessment.macros.value.fatGrams;

  // Streak calculation
  const weightDates = weights.map((w) => w.date);
  const activeStreak = calculateStreak([todayStr, ...weightDates]);

  // Adjust today's workout if readiness requires volume reduction
  const readinessAdj = readiness?.adjustment || 'keep';
  const adjustedWorkoutExercises = todayWorkout?.exercises.map((pe) => {
    if (readinessAdj === 'reduce_volume') {
      // Reduce sets by ~30%
      const reducedCount = Math.max(2, Math.round(pe.sets.length * 0.7));
      return { ...pe, sets: pe.sets.slice(0, reducedCount) };
    }
    return pe;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#FF6B1A] block mb-1">
            FITNESS INTELLIGENCE • SYSTEM ACTIVE
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-[var(--text)] tracking-tight">
            Welcome back, <span className="font-semibold">{profile.name}</span>.
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
            {profile.goal.replace('_', ' ').toUpperCase()} PROTOCOL • {profile.trainingDaysPerWeek} DAYS/WEEK
          </p>
        </div>

        {/* Streak & Adherence Pills */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#FF6B1A]" />
            <span className="font-bold text-[var(--text)] tabular-nums">{activeStreak}</span>
            <span className="text-[var(--muted)]">day streak</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#FF6B1A]" />
            <span className="font-bold text-[var(--text)] tabular-nums">92%</span>
            <span className="text-[var(--muted)]">adherence</span>
          </div>
        </div>
      </div>

      {/* 3-Tap Readiness Checkin Component */}
      {!isRed && (
        <ReadinessCheckin
          currentScore={readiness?.calculatedScore}
          currentAdjustment={readiness?.adjustment}
          explanation={readiness?.explanation}
          onSubmit={handleReadinessSubmit}
        />
      )}

      {/* Primary Metrics Grid (Calorie Ring, Macros, Water) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Calorie Ring */}
        <Card variant="default" className="p-6 border-[var(--border)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <span className="text-xs uppercase font-bold tracking-wider text-[var(--muted)]">
              Daily Caloric Balance
            </span>
            <button
              onClick={() =>
                openDrawer({
                  title: 'Daily Calorie Target',
                  valueDisplay: `${targetCalories} kcal`,
                  explanation: assessment.goalCalories.explanation,
                })
              }
              className="text-xs text-[#FF6B1A] hover:underline font-semibold cursor-pointer"
            >
              Why this?
            </button>
          </div>

          <div className="py-4 flex items-center justify-center">
            <Ring
              value={currentCalories}
              target={targetCalories}
              size={150}
              strokeWidth={10}
              useCalorieGradient
              unit="kcal"
              label="Remaining"
              sublabel={`${Math.max(0, targetCalories - currentCalories)} left`}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)] text-[var(--muted)]">
            <span>Consumed: <strong className="text-[var(--text)] tabular-nums">{currentCalories}</strong></span>
            <span>Target: <strong className="text-[var(--text)] tabular-nums">{targetCalories}</strong></span>
          </div>
        </Card>

        {/* Card 2: Macronutrient Progress */}
        <Card variant="default" className="p-6 border-[var(--border)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <span className="text-xs uppercase font-bold tracking-wider text-[var(--muted)]">
              Macronutrient Progress
            </span>
            <button
              onClick={() =>
                openDrawer({
                  title: 'Macronutrient Targets',
                  valueDisplay: `${targetProtein}g P / ${targetCarbs}g C / ${targetFat}g F`,
                  explanation: assessment.macros.explanation,
                })
              }
              className="text-xs text-[#FF6B1A] hover:underline font-semibold cursor-pointer"
            >
              Why this?
            </button>
          </div>

          {/* Macro Bars */}
          <div className="space-y-3.5 flex-1 justify-center flex flex-col">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#FF6B1A]">Protein</span>
                <span className="text-[var(--text)] tabular-nums font-semibold">
                  {currentProtein} / {targetProtein} g
                </span>
              </div>
              <div className="h-2 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (currentProtein / targetProtein) * 100)}%` }}
                  className="h-full bg-[#FF6B1A] rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#FFB547]">Carbohydrates</span>
                <span className="text-[var(--text)] tabular-nums font-semibold">
                  {currentCarbs} / {targetCarbs} g
                </span>
              </div>
              <div className="h-2 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (currentCarbs / targetCarbs) * 100)}%` }}
                  className="h-full bg-[#FFB547] rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Fats */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#D97706] dark:text-[#FFE3C4]">Dietary Fats</span>
                <span className="text-[var(--text)] tabular-nums font-semibold">
                  {currentFat} / {targetFat} g
                </span>
              </div>
              <div className="h-2 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (currentFat / targetFat) * 100)}%` }}
                  className="h-full bg-[#FFE3C4] rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/nutrition')}
            className="w-full text-xs font-semibold"
          >
            Open Food Diary
          </Button>
        </Card>

        {/* Card 3: Water Tracker & Quick-Add */}
        <Card variant="default" className="p-6 border-[var(--border)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <span className="text-xs uppercase font-bold tracking-wider text-[var(--muted)]">
              Daily Hydration
            </span>
            <button
              onClick={() =>
                openDrawer({
                  title: 'Hydration Target',
                  valueDisplay: `${(targetWater / 1000).toFixed(1)} L`,
                  explanation: assessment.waterTarget.explanation,
                })
              }
              className="text-xs text-[#FF6B1A] hover:underline font-semibold cursor-pointer"
            >
              Why this?
            </button>
          </div>

          <div className="py-3 flex items-center justify-center">
            <Ring
              value={currentWater}
              target={targetWater}
              size={130}
              strokeWidth={8}
              color="#38BDF8"
              unit="ml"
              label="Hydration"
              sublabel={`${(currentWater / 1000).toFixed(1)} / ${(targetWater / 1000).toFixed(1)} L`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleAddWater(250)}
              className="py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface)] text-xs font-semibold text-sky-500 dark:text-sky-400 border border-[var(--border)] transition-all flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+250 ml</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddWater(500)}
              className="py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface)] text-xs font-semibold text-sky-500 dark:text-sky-400 border border-[var(--border)] transition-all flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+500 ml</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Middle Row: Today's Workout Card & Weight Sparkline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Workout Card */}
        <div className="lg:col-span-7">
          <Card variant="default" className="p-6 border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#FF6B1A]" />
                <span className="text-xs uppercase font-bold tracking-wider text-[var(--text)]">
                  Today's Session
                </span>
                {readinessAdj === 'reduce_volume' && (
                  <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    -30% Volume Applied
                  </span>
                )}
              </div>

              {plan && (
                <button
                  onClick={() =>
                    openDrawer({
                      title: 'Today\'s Programming',
                      valueDisplay: todayWorkout?.title || 'Session',
                      explanation: plan.explanation,
                    })
                  }
                  className="text-xs text-[#FF6B1A] hover:underline font-semibold cursor-pointer"
                >
                  Why this?
                </button>
              )}
            </div>

            {isRed ? (
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-300">
                Exercise is contraindicated due to exertional symptoms. Please consult a qualified physician.
              </div>
            ) : todayWorkout ? (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-bold text-[var(--text)]">{todayWorkout.title}</h3>
                  <span className="text-xs text-[var(--muted)] tabular-nums">
                    {todayWorkout.targetDurationMin} min • {adjustedWorkoutExercises?.length} exercises
                  </span>
                </div>

                <div className="space-y-2">
                  {adjustedWorkoutExercises?.slice(0, 4).map((ex, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[var(--text)] block">
                          {ex.exercise.name}
                        </span>
                        <span className="text-[11px] text-[var(--muted)]">
                          {ex.sets.length} sets × {ex.sets[0]?.targetReps} reps • RPE {ex.sets[0]?.targetRpe}
                        </span>
                      </div>
                      {ex.isSubstituted && (
                        <span className="text-[10px] font-semibold text-amber-500 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          Joint Safe
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate('/workout')}
                    className="flex-1 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Today's Workout</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => navigate('/form-checker')}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    Form AI
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[var(--muted)]">
                Rest day scheduled. Enjoy your recovery!
              </div>
            )}
          </Card>
        </div>

        {/* Weight Sparkline & Quick Weigh-In */}
        <div className="lg:col-span-5">
          <Card variant="default" className="p-6 border-[var(--border)] space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <span className="text-xs uppercase font-bold tracking-wider text-[var(--muted)]">
                Weight Progression
              </span>
              <button
                type="button"
                onClick={() => setShowWeightModal(true)}
                className="text-xs text-[#FF6B1A] hover:underline font-semibold cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Weigh-In</span>
              </button>
            </div>

            {/* Current Weight & Delta */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-[var(--text)] tabular-nums">
                  {profile.weightKg}
                </span>
                <span className="text-sm text-[var(--muted)]">kg</span>
                {weights.length >= 2 && (
                  <span className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 ml-auto flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>
                      {(weights[weights.length - 1].weightKg - weights[0].weightKg).toFixed(1)} kg overall
                    </span>
                  </span>
                )}
              </div>
              <span className="text-xs text-[var(--muted)] block mt-0.5">
                Target: {profile.targetWeightKg || '--'} kg
              </span>
            </div>

            {/* Minimalist SVG Sparkline */}
            <div className="h-20 w-full flex items-end gap-1.5 pt-4">
              {weights.slice(-14).map((w, idx) => {
                const min = Math.min(...weights.map((x) => x.weightKg)) - 0.5;
                const max = Math.max(...weights.map((x) => x.weightKg)) + 0.5;
                const heightPct = Math.max(15, Math.min(100, ((w.weightKg - min) / (max - min)) * 100));

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer"
                    title={`${w.date}: ${w.weightKg} kg`}
                  >
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t transition-all ${
                        idx === weights.slice(-14).length - 1
                          ? 'bg-[#FF6B1A]'
                          : 'bg-black/10 dark:bg-white/10 group-hover:bg-black/20 dark:group-hover:bg-white/30'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/progress')}
              className="w-full text-xs font-semibold"
            >
              View Analytics & Charts
            </Button>
          </Card>
        </div>
      </div>

      {/* Longevity Habits Guideline Card */}
      {guidelineProgress && (
        <Card
          variant="surface2"
          className="p-6 border-[var(--border)] bg-[var(--surface)] space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FF6B1A]/15 text-[#FF6B1A]">
                <Activity className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[var(--text)] tracking-tight">
                    Longevity Habits Guideline
                  </h3>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)]">
                    Guideline • Not a Health Score
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Weekly progress against WHO/CDC public-health longevity benchmarks
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                openDrawer({
                  title: 'Longevity Activity Guidelines',
                  valueDisplay: `${guidelineProgress.activeMinutes.current}/150 min • ${guidelineProgress.strengthDays.current}/2 days`,
                  explanation: guidelineProgress.explanation,
                })
              }
              className="text-xs text-[#FF6B1A] hover:underline font-semibold cursor-pointer self-start sm:self-auto"
            >
              Why this?
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
            {/* Ring 1: Active Movement Minutes (Target: 150 min) */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
              <Ring
                value={guidelineProgress.activeMinutes.current}
                target={guidelineProgress.activeMinutes.target}
                size={96}
                strokeWidth={7}
                color="#FF6B1A"
                unit="m"
                label="Active"
                sublabel={`${guidelineProgress.activeMinutes.percentage}%`}
              />
              <div className="flex-1">
                <span className="text-xs uppercase font-bold tracking-wider text-[#FF6B1A]">
                  Active Movement
                </span>
                <div className="text-xl font-bold text-[var(--text)] mt-1 tabular-nums">
                  {guidelineProgress.activeMinutes.current}{' '}
                  <span className="text-xs font-normal text-[var(--muted)]">/ 150 min</span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Aerobic and conditioning volume accumulated this week.
                </p>
              </div>
            </div>

            {/* Ring 2: Strength Days (Target: 2 days) */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
              <Ring
                value={guidelineProgress.strengthDays.current}
                target={guidelineProgress.strengthDays.target}
                size={96}
                strokeWidth={7}
                color="#22C55E"
                unit="d"
                label="Strength"
                sublabel={`${guidelineProgress.strengthDays.percentage}%`}
              />
              <div className="flex-1">
                <span className="text-xs uppercase font-bold tracking-wider text-green-600 dark:text-[#22C55E]">
                  Muscle Strengthening
                </span>
                <div className="text-xl font-bold text-[var(--text)] mt-1 tabular-nums">
                  {guidelineProgress.strengthDays.current}{' '}
                  <span className="text-xs font-normal text-[var(--muted)]">/ 2 days</span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Dedicated resistance training sessions completed this week.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)]">
            <span className="italic">{guidelineProgress.caveat}</span>
            <span className="font-mono text-[11px] text-[var(--muted)]">Resets Monday 00:00</span>
          </div>
        </Card>
      )}

      {/* Adaptive Weekly Review Card */}
      {weeklyReview && (
        <Card
          variant="surface2"
          className="p-6 md:p-7 border-[#FF6B1A]/25 bg-gradient-to-r from-[var(--surface-2)] to-[var(--surface)] space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FF6B1A]/15 text-[#FF6B1A]">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-[var(--text)] tracking-tight">
                Adaptive Weekly Review
              </h3>
              {weeklyReview.accepted && (
                <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Adjustment Accepted
                </span>
              )}
            </div>

            <button
              onClick={() =>
                openDrawer({
                  title: 'Weekly Review Logic',
                  valueDisplay: `${weeklyReview.suggestedAdjustmentKcal} kcal adjustment`,
                  explanation: weeklyReview.explanation,
                })
              }
              className="text-xs text-[#FF6B1A] hover:underline font-semibold cursor-pointer self-start sm:self-auto"
            >
              Why this?
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text)] opacity-90 leading-relaxed max-w-3xl">
            {weeklyReview.insight}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[var(--border)]">
            <div className="text-xs text-[var(--muted)]">
              <span>Recommended Target Adaptation: </span>
              <strong className="text-[var(--text)] font-mono tabular-nums">
                {weeklyReview.suggestedAdjustmentKcal > 0
                  ? `+${weeklyReview.suggestedAdjustmentKcal} kcal`
                  : weeklyReview.suggestedAdjustmentKcal < 0
                  ? `${weeklyReview.suggestedAdjustmentKcal} kcal`
                  : 'Maintain current target'}
              </strong>
            </div>

            {!weeklyReview.accepted && weeklyReview.suggestedAdjustmentKcal !== 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => showToast('Weekly adjustment dismissed.', 'info')}
                  className="text-xs"
                >
                  Dismiss
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAcceptReview}
                  className="text-xs font-bold"
                >
                  Accept & Adapt Target
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Quick Weight Modal */}
      {showWeightModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-2xl max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-[var(--text)]">Record Morning Weigh-In</h3>
            <p className="text-xs text-[var(--muted)]">
              Weigh post-waking and post-voiding for optimal consistency.
            </p>
            <form onSubmit={handleQuickWeightSubmit} className="space-y-4">
              <input
                type="number"
                step="0.1"
                autoFocus
                placeholder="e.g. 74.2"
                value={quickWeight}
                onChange={(e) => setQuickWeight(e.target.value)}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-lg font-bold text-[var(--text)] tabular-nums focus:border-[#FF6B1A] focus:outline-none min-h-[48px]"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Weight
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
