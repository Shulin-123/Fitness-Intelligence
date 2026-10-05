import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scan,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Info,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SetLogger } from '../components/ui/SetLogger';
import { RestTimer } from '../components/ui/RestTimer';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useWhyDrawer } from '../context/WhyDrawerContext';
import { useToast } from '../context/ToastContext';
import { services } from '../services/registry';
import type {
  WeeklyPlan,
  PlannedExercise,
  LoggedSet,
  Exercise,
} from '../types';

export const WorkoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { openDrawer } = useWhyDrawer();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);

  // Logging state: Map of exerciseId -> LoggedSet[]
  const [loggedSets, setLoggedSets] = useState<Record<string, LoggedSet[]>>({});

  // Active exercise cue details modal
  const [detailExercise, setDetailExercise] = useState<PlannedExercise | null>(null);

  // Finish session modal
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  const loadWorkoutData = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await services.profile.getProfile();
      if (!p) {
        navigate('/onboarding');
        return;
      }

      const assess = services.assessment.calculateAssessment(p);
      if (assess.safety.tier === 'red') {
        setError('Automated workouts are suspended for medical safety.');
        return;
      }

      let currentPlan = await services.plan.getWeeklyPlan();
      if (!currentPlan) {
        currentPlan = await services.plan.generateAndSavePlan(p);
      }
      setPlan(currentPlan);

      const lib = await services.plan.getExerciseLibrary();
      setExerciseLibrary(lib);

      // Initialize default logged sets based on planned exercises
      if (currentPlan && currentPlan.days.length > 0) {
        const activeDay = currentPlan.days[selectedDayIdx] || currentPlan.days[0];
        const initialSets: Record<string, LoggedSet[]> = {};
        activeDay.exercises.forEach((ex) => {
          initialSets[ex.exerciseId] = ex.sets.map((s) => ({
            setNumber: s.setNumber,
            reps: parseInt(s.targetReps.split('-')[0], 10) || 10,
            weightKg: 0,
            completed: false,
          }));
        });
        setLoggedSets(initialSets);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load workout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkoutData();
  }, [selectedDayIdx]);

  const handleSetChange = (
    exerciseId: string,
    setIdx: number,
    field: 'weightKg' | 'reps' | 'completed',
    value: number | boolean
  ) => {
    setLoggedSets((prev) => {
      const current = prev[exerciseId] || [];
      const updated = current.map((s, i) =>
        i === setIdx ? { ...s, [field]: value } : s
      );
      return { ...prev, [exerciseId]: updated };
    });
  };

  const handleAddSet = (exerciseId: string) => {
    setLoggedSets((prev) => {
      const current = prev[exerciseId] || [];
      const newSet: LoggedSet = {
        setNumber: current.length + 1,
        reps: 10,
        weightKg: current[current.length - 1]?.weightKg || 0,
        completed: false,
      };
      return { ...prev, [exerciseId]: [...current, newSet] };
    });
  };

  const handleSubstituteExercise = (currentExerciseId: string, newExercise: Exercise) => {
    if (!plan) return;

    // Swap in active plan
    const updatedDays = plan.days.map((d, dIdx) => {
      if (dIdx !== selectedDayIdx) return d;
      const updatedExercises = d.exercises.map((pe) => {
        if (pe.exerciseId === currentExerciseId) {
          return {
            ...pe,
            exerciseId: newExercise.id,
            exercise: newExercise,
            isSubstituted: true,
            originalExerciseName: pe.exercise.name,
            notes: `Joint-safe variation substituted for ${pe.exercise.name}`,
          };
        }
        return pe;
      });
      return { ...d, exercises: updatedExercises };
    });

    const updatedPlan = { ...plan, days: updatedDays };
    setPlan(updatedPlan);

    // Update logged sets mapping
    setLoggedSets((prev) => {
      const existing = prev[currentExerciseId] || [];
      const next = { ...prev };
      delete next[currentExerciseId];
      next[newExercise.id] = existing;
      return next;
    });

    setDetailExercise(null);
    showToast(`Substituted with ${newExercise.name}`, 'info');
  };

  const handleFinishWorkout = async () => {
    if (!plan) return;
    const activeDay = plan.days[selectedDayIdx];

    const loggedExercises = activeDay.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exercise.name,
      sets: loggedSets[ex.exerciseId] || [],
    }));

    await services.workout.logWorkoutSession({
      date: new Date().toISOString().split('T')[0],
      planDayTitle: activeDay.title,
      durationMinutes: activeDay.targetDurationMin,
      completed: true,
      notes: sessionNotes,
      exercises: loggedExercises,
    });

    setShowFinishModal(false);
    showToast(`Great work! ${activeDay.title} session logged.`, 'success');
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="py-12 max-w-md mx-auto">
        <ErrorState
          title="Workout Plan Unavailable"
          message={error || 'Unable to load exercises.'}
          onRetry={loadWorkoutData}
        />
      </div>
    );
  }

  const activeDay = plan.days[selectedDayIdx] || plan.days[0];
  const totalCompletedSets = Object.values(loggedSets)
    .flat()
    .filter((s) => s.completed).length;
  const totalSets = Object.values(loggedSets).flat().length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#FF6B1A]">
              {plan.splitName}
            </span>
            {plan.safeSplitId && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                🛡️ Safe Split Active
              </span>
            )}
            {plan.volumeTier === 'amber_reduced' && !plan.safeSplitId && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Amber Joint Safe
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[var(--text)] tracking-tight">
            {activeDay.title}
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {activeDay.targetDurationMin} min • {activeDay.exercises.length} movements • Focus: {activeDay.focusMuscles.join(', ')}
          </p>
        </div>

        <button
          onClick={() =>
            openDrawer({
              title: plan.splitName,
              valueDisplay: `${plan.daysPerWeek} Days / Week`,
              explanation: plan.explanation,
            })
          }
          className="text-xs text-[#FF6B1A] hover:underline font-semibold cursor-pointer self-start sm:self-auto flex items-center gap-1"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Why this plan?</span>
        </button>
      </div>

      {/* Weekly Split Day Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {plan.days.map((day, idx) => (
          <button
            key={day.dayNumber}
            type="button"
            onClick={() => setSelectedDayIdx(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[44px] ${
              selectedDayIdx === idx
                ? 'bg-[#FF6B1A] text-[#0F0B09] font-bold'
                : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            Day {day.dayNumber}: {day.title}
          </button>
        ))}
      </div>

      {/* Integrated Rest Timer Banner */}
      <RestTimer initialSeconds={75} />

      {/* Exercise List & Set Loggers */}
      <div className="space-y-4">
        {activeDay.exercises.map((pe, exIdx) => {
          const exerciseSets = loggedSets[pe.exerciseId] || [];
          const hasVideoAI = Boolean(pe.exercise.videoAnalysisSupported);

          return (
            <Card
              key={pe.exerciseId}
              variant="default"
              className="p-5 md:p-6 border-[var(--border)] space-y-4"
            >
              {/* Exercise Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[var(--muted)]">
                      #{exIdx + 1}
                    </span>
                    <h3 className="text-base font-bold text-[var(--text)] tracking-tight">
                      {pe.exercise.name}
                    </h3>
                    {pe.isSubstituted && (
                      <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Substituted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1 italic">
                    "{pe.exercise.shortCueText}"
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* Cues & Substitutions trigger */}
                  <button
                    type="button"
                    onClick={() => setDetailExercise(pe)}
                    className="p-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg border border-[var(--border)] transition-colors flex items-center gap-1 cursor-pointer min-h-[36px]"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Cues / Swap</span>
                  </button>

                  {/* Form AI shortcut */}
                  {hasVideoAI && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/form-checker?exercise=${pe.exercise.videoAnalysisSupported}`)
                      }
                      className="text-xs font-semibold flex items-center gap-1.5 text-[#FF6B1A] border-[#FF6B1A]/30 hover:bg-[#FF6B1A]/10"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      <span>Analyze Form</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Set Logger Component */}
              <SetLogger
                sets={exerciseSets}
                targetRepsHint={pe.sets[0]?.targetReps}
                onSetChange={(sIdx, field, val) =>
                  handleSetChange(pe.exerciseId, sIdx, field, val)
                }
                onAddSet={() => handleAddSet(pe.exerciseId)}
              />
            </Card>
          );
        })}
      </div>

      {/* Bottom Sticky Action Finish Bar */}
      <div className="p-4 rounded-2xl bg-[var(--surface)]/95 border border-[var(--border)] backdrop-blur-md sticky bottom-20 md:bottom-4 z-20 flex items-center justify-between gap-4 shadow-2xl">
        <div className="text-xs">
          <span className="text-[var(--muted)] block">Workout Progress</span>
          <span className="text-[var(--text)] font-bold text-sm tabular-nums">
            {totalCompletedSets} / {totalSets} sets marked done
          </span>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setShowFinishModal(true)}
          className="flex items-center gap-2 font-bold cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          <span>Complete Session</span>
        </Button>
      </div>

      {/* Exercise Detail / Substitution Modal */}
      {detailExercise && (
        <Modal
          isOpen={Boolean(detailExercise)}
          onClose={() => setDetailExercise(null)}
          title={detailExercise.exercise.name}
          description={`Target muscle: ${detailExercise.exercise.muscleGroup} • Equipment: ${detailExercise.exercise.equipment}`}
        >
          <div className="space-y-4 text-xs">
            {/* Form Cue */}
            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
              <span className="font-bold text-[var(--text)] block uppercase tracking-wider text-[10px]">
                Execution Cue
              </span>
              <p className="text-sm text-[var(--text)] leading-relaxed">
                {detailExercise.exercise.shortCueText}
              </p>
            </div>

            {/* Contraindication alerts */}
            {detailExercise.exercise.contraindicationTags.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Biomechanical Caution</span>
                  <span>
                    Caution for joints: {detailExercise.exercise.contraindicationTags.join(', ')}. If you experience discomfort, swap below.
                  </span>
                </div>
              </div>
            )}

            {/* Substitution candidates */}
            <div className="space-y-2 pt-2">
              <span className="font-bold text-[var(--text)] block uppercase tracking-wider text-[10px]">
                Safe Movement Substitutions
              </span>
              <div className="space-y-2">
                {exerciseLibrary
                  .filter(
                    (e) =>
                      e.muscleGroup === detailExercise.exercise.muscleGroup &&
                      e.id !== detailExercise.exercise.id
                  )
                  .slice(0, 3)
                  .map((alt) => (
                    <div
                      key={alt.id}
                      className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="font-semibold text-[var(--text)] block text-sm">
                          {alt.name}
                        </span>
                        <span className="text-[11px] text-[var(--muted)]">
                          {alt.equipment} • {alt.difficulty}
                        </span>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleSubstituteExercise(detailExercise.exercise.id, alt)
                        }
                        className="text-xs"
                      >
                        Swap In
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Finish Session Modal */}
      {showFinishModal && (
        <Modal
          isOpen={showFinishModal}
          onClose={() => setShowFinishModal(false)}
          title="Complete Workout Session"
          description={`Log performance metrics for ${activeDay.title}.`}
          footer={
            <>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShowFinishModal(false)}
              >
                Keep Training
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleFinishWorkout}
              >
                Confirm & Log
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs">
              <div>
                <span className="text-[var(--muted)] block">Completed Sets</span>
                <span className="text-xl font-bold text-[var(--text)] tabular-nums">
                  {totalCompletedSets}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted)] block">Duration</span>
                <span className="text-xl font-bold text-[var(--text)] tabular-nums">
                  {activeDay.targetDurationMin} min
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1.5">
                Session Notes & Perceived Exertion (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="How did the session feel? Any joint tightness or PRs?"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--text)] focus:border-[#FF6B1A] focus:outline-none"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
