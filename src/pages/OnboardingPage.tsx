import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  AlertCircle,
  Activity,
  User,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StepCard } from '../components/ui/StepCard';
import { Toggle } from '../components/ui/Toggle';
import { MedicalReportUploader } from '../components/ui/MedicalReportUploader';
import { services } from '../services/registry';
import { useToast } from '../context/ToastContext';
import type {
  Goal,
  ExperienceLevel,
  Sex,
  ActivityLevel,
  DietPreference,
  UnitSystem,
  UserProfile,
  SafetyScreenResponses,
} from '../types';

const DRAFT_STORAGE_KEY = 'fitness_onboarding_draft';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [step, setStep] = useState<number>(1);

  // Form State
  const [goal, setGoal] = useState<Goal>(
    (searchParams.get('goal') as Goal) || 'build_muscle'
  );
  const [experience, setExperience] = useState<ExperienceLevel>('beginner');
  const [trainingDays, setTrainingDays] = useState<number>(3);
  const [sessionTime, setSessionTime] = useState<30 | 45 | 60 | 90>(45);

  const [name, setName] = useState<string>('');
  const [nameError, setNameError] = useState<string | null>(null);

  const [units, setUnits] = useState<UnitSystem>('metric');
  const [age, setAge] = useState<number | ''>('');
  const [sex, setSex] = useState<Sex | ''>('');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [targetWeightKg, setTargetWeightKg] = useState<number | ''>('');

  // Validation / Under-18 warning & biometric field errors
  const [ageError, setAgeError] = useState<string | null>(null);
  const [sexError, setSexError] = useState<string | null>(null);
  const [heightError, setHeightError] = useState<string | null>(null);
  const [weightError, setWeightError] = useState<string | null>(null);

  // Safety screen responses
  const [safety, setSafety] = useState<SafetyScreenResponses>({
    conditionAffectingExercise: false,
    diagnosedCardiovascularOrBP: false,
    recentSurgery: false,
    recentSurgeryCleared: true,
    recentSurgeryDate: '',
    injuryOrPain: false,
    injuryAreas: [],
    pregnantOrBreastfeeding: false,
    concerningSymptomsDuringExercise: false,
    medicalConditions: [],
    medicalConditionNotes: '',
    uploadedReport: undefined,
  });

  // Nutrition state
  const [dietPreference, setDietPreference] = useState<DietPreference>('non_veg');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [foodExclusions] = useState<string[]>([]);

  // Restore draft state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.name) setName(draft.name);
        if (draft.goal) setGoal(draft.goal);
        if (draft.experience) setExperience(draft.experience);
        if (draft.trainingDays) setTrainingDays(draft.trainingDays);
        if (draft.sessionTime) setSessionTime(draft.sessionTime);
        if (draft.units) setUnits(draft.units);
        if (draft.age !== undefined && draft.age !== '') setAge(draft.age);
        if (draft.sex) setSex(draft.sex);
        if (draft.heightCm !== undefined && draft.heightCm !== '') setHeightCm(draft.heightCm);
        if (draft.weightKg !== undefined && draft.weightKg !== '') setWeightKg(draft.weightKg);
        if (draft.targetWeightKg !== undefined && draft.targetWeightKg !== '') setTargetWeightKg(draft.targetWeightKg);
        if (draft.safety) setSafety(draft.safety);
        if (draft.dietPreference) setDietPreference(draft.dietPreference);
        if (draft.activityLevel) setActivityLevel(draft.activityLevel);
        if (draft.step) setStep(draft.step);
      } else {
        const currentUser = services.auth.getCurrentUser();
        if (currentUser?.name && currentUser.name !== 'Alex Morgan' && currentUser.name !== 'User') {
          setName(currentUser.name);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save draft state on change
  useEffect(() => {
    const draft = {
      name,
      step,
      goal,
      experience,
      trainingDays,
      sessionTime,
      units,
      age,
      sex,
      heightCm,
      weightKg,
      targetWeightKg,
      safety,
      dietPreference,
      activityLevel,
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [
    name,
    step,
    goal,
    experience,
    trainingDays,
    sessionTime,
    units,
    age,
    sex,
    heightCm,
    weightKg,
    targetWeightKg,
    safety,
    dietPreference,
    activityLevel,
  ]);

  const validateAge = (value: number | '') => {
    setAge(value);
    if (value === '') {
      setAgeError(null);
      return;
    }
    if (value < 18) {
      setAgeError(
        'Fitness Intelligence is designed for adults 18 and older to ensure safe physiological parameters. If you are under 18, please work with a certified youth coach or pediatrician.'
      );
    } else {
      setAgeError(null);
    }
  };

  const handleNext = () => {
    if (step === 2) {
      let hasError = false;

      if (!name.trim()) {
        setNameError('Please enter your name to calibrate your baseline profile.');
        hasError = true;
      } else {
        setNameError(null);
      }

      if (age === '' || Number(age) < 18) {
        setAgeError(
          age === ''
            ? 'Please enter your age.'
            : 'Fitness Intelligence is designed for adults 18 and older. Please enter an age of 18 or above.'
        );
        hasError = true;
      } else {
        setAgeError(null);
      }

      if (!sex) {
        setSexError('Please select your biological sex for metabolic rate calculations.');
        hasError = true;
      } else {
        setSexError(null);
      }

      if (heightCm === '' || Number(heightCm) <= 0) {
        setHeightError(`Please enter your height in ${units === 'metric' ? 'cm' : 'inches'}.`);
        hasError = true;
      } else {
        setHeightError(null);
      }

      if (weightKg === '' || Number(weightKg) <= 0) {
        setWeightError(`Please enter your current body weight in ${units === 'metric' ? 'kg' : 'lbs'}.`);
        hasError = true;
      } else {
        setWeightError(null);
      }

      if (hasError) return;
    }
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/');
    } else {
      setStep((prev) => Math.max(1, prev - 1));
    }
  };

  const handleFinish = async () => {
    const finalHeightCm =
      units === 'imperial' && typeof heightCm === 'number'
        ? Math.round(heightCm * 2.54)
        : typeof heightCm === 'number'
        ? heightCm
        : 175;

    const finalWeightKg =
      units === 'imperial' && typeof weightKg === 'number'
        ? Math.round((weightKg / 2.20462) * 10) / 10
        : typeof weightKg === 'number'
        ? weightKg
        : 70;

    const finalTargetWeightKg =
      targetWeightKg !== '' && typeof targetWeightKg === 'number'
        ? units === 'imperial'
          ? Math.round((targetWeightKg / 2.20462) * 10) / 10
          : targetWeightKg
        : undefined;

    const profilePayload: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim() || 'Alex Morgan',
      age: typeof age === 'number' ? age : 25,
      sex: (sex as Sex) || 'unspecified',
      heightCm: finalHeightCm,
      weightKg: finalWeightKg,
      targetWeightKg: finalTargetWeightKg,
      goal,
      experience,
      trainingDaysPerWeek: trainingDays,
      sessionDurationMin: sessionTime,
      activityLevel,
      dietPreference,
      allergies,
      foodExclusions,
      units,
      safetyResponses: safety,
    };

    await services.auth.signup(profilePayload);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    showToast('Your baseline was calibrated and verified.', 'success');
    navigate('/assessment');
  };

  const toggleInjuryArea = (area: 'knee' | 'shoulder' | 'lower_back' | 'wrist') => {
    setSafety((prev) => {
      const current = prev.injuryAreas || [];
      const updated = current.includes(area)
        ? current.filter((a) => a !== area)
        : [...current, area];
      return { ...prev, injuryAreas: updated };
    });
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const PRESET_CONDITIONS = [
    'Lower Back / Disc Limitation',
    'Knee / Joint Shear Sensitivity',
    'Shoulder Impingement / Rotator Cuff',
    'Hypertension / Elevated Blood Pressure',
    'Asthma / Respiratory Sensitivity',
    'Post-Surgical Rehabilitation',
    'Osteoarthritis / Joint Stiffness',
  ];

  const toggleMedicalCondition = (cond: string) => {
    setSafety((prev) => {
      const current = prev.medicalConditions || [];
      const updated = current.includes(cond)
        ? current.filter((c) => c !== cond)
        : [...current, cond];
      return {
        ...prev,
        medicalConditions: updated,
        conditionAffectingExercise: updated.length > 0 ? true : prev.conditionAffectingExercise,
      };
    });
  };

  const handleKeywordsDetected = (
    conditions: string[],
    injuryAreas: ('knee' | 'shoulder' | 'lower_back' | 'wrist' | 'ankle' | 'neck')[]
  ) => {
    setSafety((prev) => {
      const existingConds = prev.medicalConditions || [];
      const mergedConds = Array.from(new Set([...existingConds, ...conditions]));
      const existingInjuries = prev.injuryAreas || [];
      const mergedInjuries = Array.from(new Set([...existingInjuries, ...injuryAreas]));
      return {
        ...prev,
        medicalConditions: mergedConds,
        injuryAreas: mergedInjuries,
        injuryOrPain: mergedInjuries.length > 0 ? true : prev.injuryOrPain,
        conditionAffectingExercise: mergedConds.length > 0 ? true : prev.conditionAffectingExercise,
      };
    });
    showToast('Medical report analyzed. Clinical keywords flagged for safety screen.', 'info');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between py-6 px-4 max-w-3xl mx-auto w-full">
      {/* Top Header & Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
            aria-label="Back to previous screen"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 1 ? 'Home' : 'Back'}</span>
          </button>

          <span className="text-xs font-mono font-semibold text-[var(--muted)] uppercase tracking-wider">
            STEP {step} OF 4
          </span>
        </div>

        {/* 4-Step Progress Bar */}
        <div className="grid grid-cols-4 gap-2 h-1.5 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-full transition-all duration-300 ${
                i <= step ? 'bg-[#FF6B1A]' : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Dynamic Step Content */}
      <div className="my-8 flex-1">
        {/* ==================================================== */}
        {/* STEP 1: GOAL & TRAINING CADENCE */}
        {/* ==================================================== */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B1A]">
                Step 1: Your Target
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-[var(--text)] tracking-tight mt-1">
                What are you aiming to achieve?
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                Every calculation is tailored to your primary metabolic goal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'build_muscle', title: 'Build Muscle', desc: 'Caloric surplus, high protein, progressive overload' },
                { id: 'lose_fat', title: 'Lose Fat', desc: 'Moderate 15% deficit with lean mass protection' },
                { id: 'maintain', title: 'Maintain Weight', desc: 'Energy balance and body recomposition' },
                { id: 'get_fitter', title: 'Get Fitter', desc: 'Cardiovascular endurance & work capacity' },
              ].map((item) => (
                <StepCard
                  key={item.id}
                  title={item.title}
                  description={item.desc}
                  selected={goal === item.id}
                  onClick={() => setGoal(item.id as Goal)}
                />
              ))}
            </div>

            {/* Experience level */}
            <div className="pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-2">
                Resistance Training Experience
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'beginner', label: 'Beginner', sub: '< 1 year' },
                  { id: 'intermediate', label: 'Intermediate', sub: '1-3 years' },
                  { id: 'advanced', label: 'Advanced', sub: '3+ years' },
                ].map((exp) => (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setExperience(exp.id as ExperienceLevel)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer min-h-[48px] ${
                      experience === exp.id
                        ? 'bg-[var(--surface-2)] border-[#FF6B1A] text-[var(--text)] shadow-sm'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    <span className="text-xs font-bold block">{exp.label}</span>
                    <span className="text-[10px] text-[var(--muted)]">{exp.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Training Days 2-6 */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Training Frequency (Days per week)
                </label>
                <span className="text-sm font-bold text-[var(--text)] tabular-nums">
                  {trainingDays} days / week
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[2, 3, 4, 5, 6].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setTrainingDays(days)}
                    className={`py-3 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer min-h-[44px] ${
                      trainingDays === days
                        ? 'bg-[#FF6B1A] border-[#FF6B1A] text-white shadow-sm'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>

            {/* Session Duration */}
            <div className="pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-2">
                Session Time Budget
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[30, 45, 60, 90].map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setSessionTime(min as 30 | 45 | 60 | 90)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                      sessionTime === min
                        ? 'bg-[#FF6B1A] text-white font-bold'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 2: BODY METRICS & 18+ VERIFICATION */}
        {/* ==================================================== */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B1A]">
                  Step 2: Biometrics
                </span>
                <h2 className="text-2xl sm:text-3xl font-light text-[var(--text)] tracking-tight mt-1">
                  Tell us about your baseline.
                </h2>
                <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                  Used for Mifflin-St Jeor metabolic expenditure calculations.
                </p>
              </div>

              <Toggle
                checked={units === 'imperial'}
                onChange={(isImp) => {
                  const newUnits = isImp ? 'imperial' : 'metric';
                  setUnits(newUnits);
                  if (heightCm !== '' && typeof heightCm === 'number') {
                    setHeightCm(newUnits === 'imperial' ? Math.round(heightCm / 2.54) : Math.round(heightCm * 2.54));
                  }
                  if (weightKg !== '' && typeof weightKg === 'number') {
                    setWeightKg(newUnits === 'imperial' ? Math.round(weightKg * 2.20462 * 10) / 10 : Math.round((weightKg / 2.20462) * 10) / 10);
                  }
                  if (targetWeightKg !== '' && typeof targetWeightKg === 'number') {
                    setTargetWeightKg(newUnits === 'imperial' ? Math.round(targetWeightKg * 2.20462 * 10) / 10 : Math.round((targetWeightKg / 2.20462) * 10) / 10);
                  }
                }}
                leftLabel="Metric (kg/cm)"
                rightLabel="Imperial (lb/in)"
              />
            </div>

            {/* User Name Input */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#FF6B1A]" />
                  <span>Enter Your Name</span>
                </span>
                <span className="text-[11px] text-[#FF6B1A] font-semibold">Required</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) {
                    setNameError(null);
                  }
                }}
                className={`w-full bg-[var(--surface-2)] border rounded-xl p-3.5 text-base font-semibold text-[var(--text)] placeholder-[var(--muted)]/50 focus:outline-none min-h-[48px] transition-colors ${
                  nameError ? 'border-red-500/80 bg-red-950/10' : 'border-[var(--border)] focus:border-[#FF6B1A]'
                }`}
              />
              {nameError && (
                <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{nameError}</span>
                </div>
              )}
            </div>

            {/* Age Input with 18+ enforcement */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1.5 flex items-center justify-between">
                <span>Age (Years)</span>
                <span className="text-[11px] text-[#FF6B1A] font-semibold">18+ Required</span>
              </label>
              <input
                type="number"
                min="18"
                max="100"
                placeholder="e.g. 25"
                value={age}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setAge('');
                    setAgeError(null);
                  } else {
                    validateAge(parseInt(val, 10));
                  }
                }}
                className={`w-full bg-[var(--surface-2)] border rounded-xl p-3.5 text-base font-bold text-[var(--text)] tabular-nums focus:outline-none min-h-[48px] ${
                  ageError ? 'border-red-500/80 bg-red-950/10' : 'border-[var(--border)] focus:border-[#FF6B1A]'
                }`}
              />
              {ageError && (
                <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{ageError}</span>
                </div>
              )}
            </div>

            {/* Biological Sex (Required for BMR formula) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-2 flex items-center justify-between">
                <span>Biological Sex (For MSJ Metabolic Offset)</span>
                <span className="text-[11px] text-[#FF6B1A] font-semibold">Required</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'male', label: 'Male (+5 offset)' },
                  { id: 'female', label: 'Female (-161 offset)' },
                  { id: 'unspecified', label: 'Prefer not to say' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSex(s.id as Sex);
                      setSexError(null);
                    }}
                    className={`py-3 px-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer min-h-[44px] ${
                      sex === s.id
                        ? 'bg-[var(--surface-2)] border-[#FF6B1A] text-[var(--text)] shadow-sm'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {sexError && (
                <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{sexError}</span>
                </div>
              )}
            </div>

            {/* Height & Weight Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5 flex items-center justify-between">
                  <span>Height {units === 'metric' ? '(cm)' : '(inches)'}</span>
                  <span className="text-[11px] text-[#FF6B1A] font-semibold">Required</span>
                </label>
                <input
                  type="number"
                  min="50"
                  max="250"
                  placeholder={units === 'metric' ? 'e.g. 175' : 'e.g. 69'}
                  value={heightCm}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHeightCm(val === '' ? '' : parseFloat(val));
                    if (val !== '') setHeightError(null);
                  }}
                  className={`w-full bg-[var(--surface-2)] border rounded-xl p-3.5 text-base font-bold text-[var(--text)] tabular-nums focus:outline-none min-h-[48px] ${
                    heightError ? 'border-red-500/80 bg-red-950/10' : 'border-[var(--border)] focus:border-[#FF6B1A]'
                  }`}
                />
                {heightError && (
                  <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{heightError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5 flex items-center justify-between">
                  <span>Weight {units === 'metric' ? '(kg)' : '(lbs)'}</span>
                  <span className="text-[11px] text-[#FF6B1A] font-semibold">Required</span>
                </label>
                <input
                  type="number"
                  min="20"
                  max="350"
                  step="0.5"
                  placeholder={units === 'metric' ? 'e.g. 70' : 'e.g. 154'}
                  value={weightKg}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWeightKg(val === '' ? '' : parseFloat(val));
                    if (val !== '') setWeightError(null);
                  }}
                  className={`w-full bg-[var(--surface-2)] border rounded-xl p-3.5 text-base font-bold text-[var(--text)] tabular-nums focus:outline-none min-h-[48px] ${
                    weightError ? 'border-red-500/80 bg-red-950/10' : 'border-[var(--border)] focus:border-[#FF6B1A]'
                  }`}
                />
                {weightError && (
                  <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{weightError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Target Weight (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                Target Weight {units === 'metric' ? '(kg)' : '(lbs)'}{' '}
                <span className="text-[11px] font-normal lowercase text-[var(--muted)]">
                  (optional)
                </span>
              </label>
              <input
                type="number"
                step="0.5"
                value={targetWeightKg}
                placeholder={units === 'metric' ? 'e.g. 68 (Optional goal weight)' : 'e.g. 150 (Optional goal weight)'}
                onChange={(e) =>
                  setTargetWeightKg(
                    e.target.value === '' ? '' : parseFloat(e.target.value)
                  )
                }
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3.5 text-base font-bold text-[var(--text)] tabular-nums focus:border-[#FF6B1A] focus:outline-none min-h-[48px]"
              />
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 3: SAFETY STRATIFICATION SCREEN */}
        {/* ==================================================== */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Step 3: Safety Screen</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-[var(--text)] tracking-tight mt-1">
                Exercise readiness & health history.
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                We calibrate exercise programming to your medical safety. Please answer honestly.
              </p>
            </div>

            <div className="space-y-3">
              {/* Question 1: Concerning Symptoms (RED FLAG) */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  safety.concerningSymptomsDuringExercise
                    ? 'bg-red-950/20 border-red-500/50'
                    : 'bg-[var(--surface)] border-[var(--border)]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text)]">
                      Do you experience chest pain, fainting, or severe breathlessness during exercise?
                    </h4>
                    <span className="text-xs text-[var(--muted)] block mt-0.5">
                      Key clinical safety marker
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setSafety((p) => ({
                          ...p,
                          concerningSymptomsDuringExercise: false,
                        }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[40px] cursor-pointer ${
                        !safety.concerningSymptomsDuringExercise
                          ? 'bg-[#FF6B1A] text-white'
                          : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)]'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSafety((p) => ({
                          ...p,
                          concerningSymptomsDuringExercise: true,
                        }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[40px] cursor-pointer ${
                        safety.concerningSymptomsDuringExercise
                          ? 'bg-[#F87171] text-white'
                          : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)]'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>

              {/* Question 2: Cardiovascular or BP */}
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text)]">
                    Diagnosed cardiovascular or high blood pressure condition?
                  </h4>
                  <span className="text-xs text-[var(--muted)] block mt-0.5">
                    Amber alert: Capped RPE & machine stabilization
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setSafety((p) => ({ ...p, diagnosedCardiovascularOrBP: false }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[40px] cursor-pointer ${
                      !safety.diagnosedCardiovascularOrBP
                        ? 'bg-[#FF6B1A] text-white'
                        : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)]'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSafety((p) => ({ ...p, diagnosedCardiovascularOrBP: true }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[40px] cursor-pointer ${
                      safety.diagnosedCardiovascularOrBP
                        ? 'bg-[#FACC15] text-[#0F0B09]'
                        : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)]'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              {/* Question 3: Recent Surgery */}
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text)]">
                      Recent surgical procedure within the past 6 months?
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setSafety((p) => ({ ...p, recentSurgery: false }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[40px] cursor-pointer ${
                        !safety.recentSurgery
                          ? 'bg-[#FF6B1A] text-white'
                          : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)]'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSafety((p) => ({ ...p, recentSurgery: true }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[40px] cursor-pointer ${
                        safety.recentSurgery
                          ? 'bg-[#FACC15] text-[#0F0B09]'
                          : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)]'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                {safety.recentSurgery && (
                  <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                    <span className="text-[var(--muted)]">
                      Have you been medically cleared by your surgeon to resume exercise?
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSafety((p) => ({
                          ...p,
                          recentSurgeryCleared: !p.recentSurgeryCleared,
                        }))
                      }
                      className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                        safety.recentSurgeryCleared
                          ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30'
                          : 'bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/30'
                      }`}
                    >
                      {safety.recentSurgeryCleared ? 'Cleared' : 'Not Cleared Yet'}
                    </button>
                  </div>
                )}
              </div>

              {/* Question 4: Current Injury or Joint Pain */}
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text)]">
                      Active pain or movement limitation in any joint?
                    </h4>
                    <span className="text-xs text-[var(--muted)] block mt-0.5">
                      Contraindicated movements will be automatically swapped
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setSafety((p) => ({
                          ...p,
                          injuryOrPain: false,
                          injuryAreas: [],
                        }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[40px] cursor-pointer ${
                        !safety.injuryOrPain
                          ? 'bg-[#FF6B1A] text-white'
                          : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)]'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSafety((p) => ({ ...p, injuryOrPain: true }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[40px] cursor-pointer ${
                        safety.injuryOrPain
                          ? 'bg-[#FACC15] text-[#0F0B09]'
                          : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)]'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                {safety.injuryOrPain && (
                  <div className="pt-2 border-t border-[var(--border)]">
                    <span className="text-xs text-[var(--muted)] block mb-2">
                      Select affected joints to exclude direct axial load:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(['knee', 'shoulder', 'lower_back', 'wrist'] as const).map(
                        (area) => {
                          const isSelected = safety.injuryAreas?.includes(area);
                          return (
                            <button
                              key={area}
                              type="button"
                              onClick={() => toggleInjuryArea(area)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer min-h-[36px] ${
                                isSelected
                                  ? 'bg-[#FACC15] text-[#0F0B09]'
                                  : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                              }`}
                            >
                              {area.replace('_', ' ')}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Question 5: Pregnancy */}
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text)]">
                    Currently pregnant or breastfeeding?
                  </h4>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setSafety((p) => ({ ...p, pregnantOrBreastfeeding: false }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[40px] cursor-pointer ${
                      !safety.pregnantOrBreastfeeding
                        ? 'bg-[#FF6B1A] text-white'
                        : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)]'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSafety((p) => ({ ...p, pregnantOrBreastfeeding: true }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[40px] cursor-pointer ${
                      safety.pregnantOrBreastfeeding
                        ? 'bg-[#FACC15] text-[#0F0B09]'
                        : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)]'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              {/* Medical Report / File Upload */}
              <div className="pt-2">
                <MedicalReportUploader
                  uploadedReport={safety.uploadedReport}
                  onReportChange={(rep) =>
                    setSafety((prev) => ({ ...prev, uploadedReport: rep }))
                  }
                  onKeywordsDetected={handleKeywordsDetected}
                />
              </div>

              {/* Diagnosed Conditions & Specific Limitations */}
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#FF6B1A]" />
                    <span>Specific Conditions or Movement Limitations</span>
                  </h4>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Select any condition below so our research engine can cross-reference CDC and ACSM clinical guidelines to protect your joints and health.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {PRESET_CONDITIONS.map((cond) => {
                    const isSelected = safety.medicalConditions?.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => toggleMedicalCondition(cond)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
                          isSelected
                            ? 'bg-[#FF6B1A] text-white shadow-sm'
                            : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                        }`}
                      >
                        {cond}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Free-form Doctor Notes or Custom Symptoms */}
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block">
                  Describe Your Problem / Physician Advice (Optional)
                </label>
                <textarea
                  value={safety.medicalConditionNotes || ''}
                  onChange={(e) =>
                    setSafety((p) => ({
                      ...p,
                      medicalConditionNotes: e.target.value,
                    }))
                  }
                  placeholder="e.g. Diagnosed with mild L4-L5 disc protrusion; doctor advises avoiding heavy vertical axial loading, but cleared for machine and seated exercises."
                  rows={3}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-3 text-xs text-[var(--text)] placeholder-[var(--muted)]/50 focus:outline-none focus:border-[#FF6B1A] transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 4: NUTRITION & ACTIVITY PREFERENCES */}
        {/* ==================================================== */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B1A]">
                Step 4: Nutrition & Lifestyle
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-[var(--text)] tracking-tight mt-1">
                Fueling preferences & daily activity.
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                Calculates macro partitioning and curated meal recommendations.
              </p>
            </div>

            {/* Diet preference */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-2">
                Dietary Framework
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'non_veg', label: 'Non-Vegetarian' },
                  { id: 'veg', label: 'Vegetarian' },
                  { id: 'vegan', label: 'Vegan' },
                  { id: 'other', label: 'Other / Flex' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDietPreference(d.id as DietPreference)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer min-h-[44px] ${
                      dietPreference === d.id
                        ? 'bg-[var(--surface-2)] border-[#FF6B1A] text-[var(--text)] shadow-sm'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Physical Activity */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-2">
                Baseline Daily Physical Activity
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, < 5,000 steps/day (1.2× BMR)' },
                  { id: 'light', label: 'Lightly Active', desc: 'Light movement, 5,000-8,000 steps/day (1.375× BMR)' },
                  { id: 'moderate', label: 'Moderately Active', desc: 'Active job or daily walking (1.55× BMR)' },
                  { id: 'very_active', label: 'Very Active', desc: 'High physical job, 12,000+ steps/day (1.725× BMR)' },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActivityLevel(act.id as ActivityLevel)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer min-h-[60px] ${
                      activityLevel === act.id
                        ? 'bg-[var(--surface-2)] border-[#FF6B1A] text-[var(--text)]'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    <span className="text-xs font-bold block text-[var(--text)]">{act.label}</span>
                    <span className="text-[11px] text-[var(--muted)] leading-snug">{act.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies / Exclusions */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-2">
                Allergies & Intolerances (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {['Dairy / Lactose', 'Gluten', 'Peanuts', 'Tree Nuts', 'Soy', 'Eggs', 'Shellfish'].map(
                  (allergy) => {
                    const isSelected = allergies.includes(allergy);
                    return (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer min-h-[36px] ${
                          isSelected
                            ? 'bg-[#FF6B1A] text-white font-bold'
                            : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                        }`}
                      >
                        {allergy}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between gap-4">
        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            Skip optional fields
          </button>
        ) : (
          <div />
        )}

        <Button
          variant="primary"
          size="lg"
          onClick={step === 4 ? handleFinish : handleNext}
          className="ml-auto flex items-center gap-2 group cursor-pointer"
        >
          <span>{step === 4 ? 'Compute Assessment & Plan' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
