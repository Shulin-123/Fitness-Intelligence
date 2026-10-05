import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Download,
  Trash2,
  Check,
  AlertTriangle,
  Sparkles,
  Sliders,
  LogOut,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { useWhyDrawer } from '../context/WhyDrawerContext';
import { useToast } from '../context/ToastContext';
import { services } from '../services/registry';
import {
  calculateBMR,
  calculateTDEE,
  calculateGoalCalories,
  calculateMacros,
  evaluateSafetyStatus,
  selectSplit,
} from '../engine/rules';
import type {
  UserProfile,
  Goal,
  ActivityLevel,
  Sex,
  DietPreference,
  UnitSystem,
  SafetyScreenResponses,
} from '../types';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { openDrawer } = useWhyDrawer();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Form draft state
  const [name, setName] = useState('');
  const [age, setAge] = useState(28);
  const [sex, setSex] = useState<Sex>('male');
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(78);
  const [targetWeightKg, setTargetWeightKg] = useState<number | undefined>(74);
  const [goal, setGoal] = useState<Goal>('lose_fat');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [trainingDays, setTrainingDays] = useState(4);
  const [sessionDuration, setSessionDuration] = useState<30 | 45 | 60 | 90>(45);
  const [dietPref, setDietPref] = useState<DietPreference>('non_veg');
  const [units, setUnits] = useState<UnitSystem>('metric');

  // Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [safetyDraft, setSafetyDraft] = useState<SafetyScreenResponses>({
    conditionAffectingExercise: false,
    diagnosedCardiovascularOrBP: false,
    recentSurgery: false,
    injuryOrPain: false,
    injuryAreas: [],
    pregnantOrBreastfeeding: false,
    concerningSymptomsDuringExercise: false,
  });

  const [saving, setSaving] = useState(false);
  const isDemo = services.auth.isDemoMode();

  const loadProfile = async () => {
    setLoading(true);
    try {
      const p = await services.profile.getProfile();
      if (!p) {
        navigate('/onboarding');
        return;
      }
      setProfile(p);
      setName(p.name);
      setAge(p.age);
      setSex(p.sex);
      setHeightCm(p.heightCm);
      setWeightKg(p.weightKg);
      setTargetWeightKg(p.targetWeightKg);
      setGoal(p.goal);
      setActivityLevel(p.activityLevel);
      setTrainingDays(p.trainingDaysPerWeek);
      setSessionDuration(p.sessionDurationMin || 45);
      setDietPref(p.dietPreference);
      setUnits(p.units);
      setSafetyDraft(p.safetyResponses);
    } catch (err) {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // 1. Compute baseline (current profile) metrics
  const currentMetrics = useMemo(() => {
    if (!profile) return null;
    const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.sex).value;
    const tdee = calculateTDEE(bmr, profile.activityLevel).value;
    const goalCal = calculateGoalCalories(tdee, profile.goal, profile.sex).value;
    const macros = calculateMacros(goalCal, profile.weightKg, profile.goal).value;
    const split = selectSplit(profile.trainingDaysPerWeek);
    return { bmr, tdee, goalCal, macros, split };
  }, [profile]);

  // 2. Compute live recalculation preview with draft values
  const previewMetrics = useMemo(() => {
    const bmr = calculateBMR(weightKg, heightCm, age, sex).value;
    const tdee = calculateTDEE(bmr, activityLevel).value;
    const goalCal = calculateGoalCalories(tdee, goal, sex).value;
    const macros = calculateMacros(goalCal, weightKg, goal).value;
    const split = selectSplit(trainingDays);
    return { bmr, tdee, goalCal, macros, split };
  }, [weightKg, heightCm, age, sex, activityLevel, goal, trainingDays]);

  // Check if anything has been modified
  const hasChanges = useMemo(() => {
    if (!profile) return false;
    return (
      name !== profile.name ||
      age !== profile.age ||
      sex !== profile.sex ||
      heightCm !== profile.heightCm ||
      weightKg !== profile.weightKg ||
      targetWeightKg !== profile.targetWeightKg ||
      goal !== profile.goal ||
      activityLevel !== profile.activityLevel ||
      trainingDays !== profile.trainingDaysPerWeek ||
      sessionDuration !== profile.sessionDurationMin ||
      dietPref !== profile.dietPreference ||
      units !== profile.units
    );
  }, [
    profile,
    name,
    age,
    sex,
    heightCm,
    weightKg,
    targetWeightKg,
    goal,
    activityLevel,
    trainingDays,
    sessionDuration,
    dietPref,
    units,
  ]);

  // Current safety status
  const currentSafety = useMemo(() => {
    if (!profile) return { tier: 'green' as const, reasons: [] };
    return evaluateSafetyStatus({
      safetyResponses: profile.safetyResponses,
      age: profile.age,
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      goal: profile.goal,
    });
  }, [profile]);

  const previewSafety = useMemo(() => {
    return evaluateSafetyStatus({
      safetyResponses: safetyDraft,
      age,
      weightKg,
      heightCm,
      goal,
    });
  }, [safetyDraft, age, weightKg, heightCm, goal]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (age < 18) {
      showToast('Fitness Intelligence is designed for adults 18 and older.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const updated: UserProfile = {
        ...profile,
        name: name.trim() || 'Athlete',
        age,
        sex,
        heightCm,
        weightKg,
        targetWeightKg,
        goal,
        activityLevel,
        trainingDaysPerWeek: trainingDays,
        sessionDurationMin: sessionDuration,
        dietPreference: dietPref,
        units,
      };

      const result = await services.profile.updateProfile(updated);
      setProfile(result);
      showToast('Profile updated & training plan regenerated!', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle Save Safety
  const handleSaveSafety = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated: UserProfile = {
        ...profile,
        safetyResponses: safetyDraft,
      };
      const result = await services.profile.updateProfile(updated);
      setProfile(result);
      setIsSafetyModalOpen(false);
      showToast('Safety screen updated & exercises adjusted.', 'success');
    } catch (err) {
      showToast('Failed to update safety screen', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle Export Data
  const handleExportData = async () => {
    try {
      const jsonStr = await services.profile.exportData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitness-intelligence-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Your complete data export has been downloaded.', 'success');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  // Handle Delete All Data
  const handleDeleteAllData = async () => {
    try {
      await services.profile.deleteData();
      showToast('All local storage data wiped.', 'info');
      setIsDeleteModalOpen(false);
      navigate('/');
      window.location.reload();
    } catch (err) {
      showToast('Failed to delete data', 'error');
    }
  };

  // Handle Log Out
  const handleLogout = async () => {
    try {
      if (services.auth.isDemoMode()) {
        await services.auth.exitDemoMode();
      }
      await services.auth.logout();
      showToast('Successfully logged out.', 'info');
      setIsLogoutModalOpen(false);
      navigate('/');
      window.location.reload();
    } catch (err) {
      showToast('Failed to log out', 'error');
    }
  };

  const handleWhyRecalculation = () => {
    openDrawer({
      title: 'Live Engine Recalculation',
      explanation: {
        formula: 'TDEE = Mifflin-St Jeor BMR × Activity Multiplier; Goal = TDEE ± Offset (Floored)',
        inputs: {
          weight: `${weightKg} kg`,
          height: `${heightCm} cm`,
          age,
          sex,
          activityLevel,
          goal,
        },
        ruleFired:
          'Deterministic mathematical re-evaluation guarantees metabolic balance before any plan changes are persisted.',
        caveat:
          'Biometric adjustments immediately reconfigure macro targets and training volume distribution.',
      },
    });
  };

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)] flex items-center gap-3">
            <span>Profile & System Settings</span>
            <Chip
              label="Why this?"
              variant="why"
              onClick={handleWhyRecalculation}
            />
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Personal biometrics, physiological constraints, unit configurations, and data sovereignty.
          </p>
        </div>

        {/* Action Badges & Log Out */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {isDemo ? (
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#FF6B1A]/10 text-[#FF6B1A] border border-[#FF6B1A]/30 font-semibold">
              Demo Persona Active
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[var(--muted)] border border-[var(--border)] font-medium">
              Local Browser Storage
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLogoutModalOpen(true)}
            className="text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 border-rose-300 dark:border-rose-500/30 text-xs py-1 px-3 min-h-[34px] cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </span>
          </Button>
        </div>
      </div>

      {/* Safety Status Banner */}
      <Card
        variant="default"
        className={`p-5 md:p-6 border ${
          currentSafety.tier === 'green'
            ? 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/10'
            : currentSafety.tier === 'amber'
            ? 'border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/10'
            : 'border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-950/10'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                currentSafety.tier === 'green'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : currentSafety.tier === 'amber'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'bg-red-500/20 text-red-600 dark:text-red-400'
              }`}
            >
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--text)] capitalize">
                  Safety Status: {currentSafety.tier} Protocol
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    currentSafety.tier === 'green'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : currentSafety.tier === 'amber'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      : 'bg-red-500/20 text-red-700 dark:text-red-300'
                  }`}
                >
                  {currentSafety.tier === 'green'
                    ? 'Full Clearance'
                    : currentSafety.tier === 'amber'
                    ? 'Substitutions Active'
                    : 'Medical Clearance Needed'}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                {currentSafety.tier === 'green' &&
                  'No joint limitations or symptoms reported. Full exercise volume & progressive overload permitted.'}
                {currentSafety.tier === 'amber' &&
                  `Modifications applied for: ${
                    profile.safetyResponses.injuryAreas?.join(', ') || 'joint sensitivity'
                  }. High-shear axial loads automatically substituted.`}
                {currentSafety.tier === 'red' &&
                  'Active medical precautions flagged. Training routines are locked until cleared by a physician.'}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsSafetyModalOpen(true)}
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#FF6B1A]" /> Update Health Screening
            </span>
          </Button>
        </div>
      </Card>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1 & 2: Primary Biometrics & Goals */}
          <div className="lg:col-span-2 space-y-6">
            <Card variant="default" className="p-6 border-[var(--border)] space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#FF6B1A]" />
                  <h2 className="text-base font-semibold text-[var(--text)]">
                    Biometric & Identity Parameters
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--muted)]">Unit System:</span>
                  <div className="flex bg-[var(--surface-2)] p-0.5 rounded-lg border border-[var(--border)] text-xs">
                    <button
                      type="button"
                      onClick={() => setUnits('metric')}
                      className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                        units === 'metric'
                          ? 'bg-[#FF6B1A] text-white font-bold'
                          : 'text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      Metric
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnits('imperial')}
                      className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                        units === 'imperial'
                          ? 'bg-[#FF6B1A] text-white font-bold'
                          : 'text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      Imperial
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[#FF6B1A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                    Biological Sex
                  </label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as Sex)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[#FF6B1A]"
                  >
                    <option value="male">Male (Mifflin-St Jeor)</option>
                    <option value="female">Female (Mifflin-St Jeor)</option>
                    <option value="unspecified">Unspecified (Blended)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                    Age (Must be 18+)
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 18)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[#FF6B1A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                    Height ({units === 'imperial' ? 'inches' : 'cm'})
                  </label>
                  <input
                    type="number"
                    value={
                      units === 'imperial'
                        ? Math.round((heightCm / 2.54) * 10) / 10
                        : heightCm
                    }
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 170;
                      setHeightCm(units === 'imperial' ? Math.round(v * 2.54) : v);
                    }}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[#FF6B1A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                    Current Weight ({units === 'imperial' ? 'lbs' : 'kg'})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={
                      units === 'imperial'
                        ? Math.round(weightKg * 2.20462 * 10) / 10
                        : weightKg
                    }
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 70;
                      setWeightKg(units === 'imperial' ? Math.round((v / 2.20462) * 10) / 10 : v);
                    }}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[#FF6B1A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                    Target Goal Weight ({units === 'imperial' ? 'lbs' : 'kg'})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={
                      targetWeightKg
                        ? units === 'imperial'
                          ? Math.round(targetWeightKg * 2.20462 * 10) / 10
                          : targetWeightKg
                        : ''
                    }
                    placeholder="Optional target"
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (isNaN(v)) setTargetWeightKg(undefined);
                      else setTargetWeightKg(units === 'imperial' ? Math.round((v / 2.20462) * 10) / 10 : v);
                    }}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[#FF6B1A]"
                  />
                </div>
              </div>
            </Card>

            {/* Training & Nutrition Parameters */}
            <Card variant="default" className="p-6 border-[var(--border)] space-y-6">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4">
                <Sliders className="w-5 h-5 text-[#FF6B1A]" />
                <h2 className="text-base font-semibold text-[var(--text)]">
                  Training & Dietary Configuration
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                    Primary Goal
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as Goal)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[#FF6B1A]"
                  >
                    <option value="lose_fat">Lose Fat (15% Deficit)</option>
                    <option value="maintain">Maintain & Recompose</option>
                    <option value="build_muscle">Build Muscle (8% Surplus)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                    Daily Activity Level
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[#FF6B1A]"
                  >
                    <option value="sedentary">Sedentary (Desk job, minimal motion)</option>
                    <option value="light">Light (1-3 days light movement)</option>
                    <option value="moderate">Moderate (3-5 days moderate exercise)</option>
                    <option value="very_active">Very Active (6-7 days hard training)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                    Training Days per Week
                  </label>
                  <select
                    value={trainingDays}
                    onChange={(e) => setTrainingDays(parseInt(e.target.value))}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[#FF6B1A]"
                  >
                    <option value="2">2 Days (Full Body Routine)</option>
                    <option value="3">3 Days (Full Body A/B/C)</option>
                    <option value="4">4 Days (Upper / Lower)</option>
                    <option value="5">5 Days (Upper / Lower / PPL)</option>
                    <option value="6">6 Days (Push / Pull / Legs ×2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                    Session Duration Budget
                  </label>
                  <select
                    value={sessionDuration}
                    onChange={(e) =>
                      setSessionDuration(
                        parseInt(e.target.value) as 30 | 45 | 60 | 90
                      )
                    }
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[#FF6B1A]"
                  >
                    <option value="30">30 Minutes (High Density)</option>
                    <option value="45">45 Minutes (Standard Balanced)</option>
                    <option value="60">60 Minutes (High Volume)</option>
                    <option value="90">90 Minutes (Elite Endurance)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                    Dietary Pattern
                  </label>
                  <select
                    value={dietPref}
                    onChange={(e) => setDietPref(e.target.value as DietPreference)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[#FF6B1A]"
                  >
                    <option value="non_veg">Non-Vegetarian (Eggs, Poultry, Fish, Meat)</option>
                    <option value="veg">Vegetarian (Dairy, Lentils, Legumes)</option>
                    <option value="vegan">Vegan (100% Plant-Based)</option>
                    <option value="other">Other / Custom</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>

          {/* Column 3: Live Recalculation Diff Preview */}
          <div className="space-y-6">
            <Card
              variant="default"
              className="p-6 border-[var(--border)] sticky top-8 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FF6B1A]" />
                  <h3 className="text-base font-bold text-[var(--text)]">
                    Engine Recalculation Diff
                  </h3>
                </div>
                <Chip
                  label="Why this?"
                  variant="why"
                  onClick={handleWhyRecalculation}
                />
              </div>

              <div className="space-y-4 text-xs">
                {/* TDEE Diff */}
                <div className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)] space-y-1">
                  <div className="flex items-center justify-between text-[var(--muted)]">
                    <span>Maintenance TDEE</span>
                    <span className="font-mono">
                      {currentMetrics?.tdee} →{' '}
                      <strong className="text-[var(--text)]">{previewMetrics.tdee}</strong> kcal
                    </span>
                  </div>
                  <div className="h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (previewMetrics.tdee / 3500) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Target Calories Diff */}
                <div className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)] space-y-1">
                  <div className="flex items-center justify-between text-[var(--muted)]">
                    <span>Prescribed Calorie Target</span>
                    <span className="font-mono">
                      {currentMetrics?.goalCal} →{' '}
                      <strong className="text-[#FF6B1A] font-bold">
                        {previewMetrics.goalCal}
                      </strong>{' '}
                      kcal
                    </span>
                  </div>
                  <div className="h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF6B1A] rounded-full"
                      style={{
                        width: `${Math.min(100, (previewMetrics.goalCal / 3500) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Macro Target Diff */}
                <div className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)] space-y-2">
                  <span className="text-[var(--muted)] block">New Target Macro Distribution:</span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-[#FF6B1A]/10 border border-[#FF6B1A]/20">
                      <span className="text-[10px] text-[#FF6B1A] font-semibold block">
                        PROTEIN
                      </span>
                      <strong className="text-[var(--text)] font-mono text-sm">
                        {previewMetrics.macros.proteinGrams}g
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[10px] text-amber-600 dark:text-[#FFB547] font-semibold block">
                        CARBS
                      </span>
                      <strong className="text-[var(--text)] font-mono text-sm">
                        {previewMetrics.macros.carbGrams}g
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <span className="text-[10px] text-orange-600 dark:text-[#FFE3C4] font-semibold block">
                        FATS
                      </span>
                      <strong className="text-[var(--text)] font-mono text-sm">
                        {previewMetrics.macros.fatGrams}g
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Split Diff */}
                <div className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)]">
                  <span className="text-[var(--muted)] block mb-1">Assigned Training Split:</span>
                  <p className="font-semibold text-[var(--text)]">
                    {previewMetrics.split.splitName}
                  </p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">
                    {previewMetrics.split.splitDescription}
                  </p>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!hasChanges || saving}
                isLoading={saving}
              >
                <span className="flex items-center gap-1.5">
                  <Check className="w-5 h-5" />
                  {hasChanges ? 'Save Changes & Regenerate Plan' : 'No Changes to Save'}
                </span>
              </Button>
            </Card>
          </div>
        </div>
      </form>

      {/* Data Sovereignty & Management */}
      <Card variant="default" className="p-6 border-[var(--border)] space-y-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--text)]">
            Data Sovereignty & Privacy Controls
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Zero-network privacy guarantee. All workouts, biometrics, and dietary logs reside strictly on this browser's local device storage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Export Button */}
          <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
                <Download className="w-4 h-4 text-[#FF6B1A]" />
                <span>Export My Data</span>
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                Download a clean, structured JSON file containing all profile metrics, exercise history, food logs, and reviews.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportData}
            >
              <span className="flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Download JSON Export
              </span>
            </Button>
          </div>

          {/* Log Out Option */}
          <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-rose-500/20 flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-2">
                <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <span>Log Out of Session</span>
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                Safely exit your active user session. Your logged data and personalized plan remain preserved on this device.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLogoutModalOpen(true)}
              className="text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-500/30 hover:bg-rose-600 hover:text-white"
            >
              <span className="flex items-center gap-1.5">
                <LogOut className="w-4 h-4" /> Log Out
              </span>
            </Button>
          </div>

          {/* Delete All Data Button */}
          <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-red-500/20 flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-red-500 dark:text-red-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                <span>Delete All Data</span>
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                Irreversibly wipe all local storage records for Fitness Intelligence from this browser.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <span className="flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" /> Wipe Local Storage
              </span>
            </Button>
          </div>
        </div>
      </Card>

      {/* App Info & Medical Disclaimer */}
      <div className="pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--muted)] space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[11px] font-mono">
            v0.1.0-alpha (Phase A)
          </span>
          <span>•</span>
          <span>Zero External API Keys</span>
          <span>•</span>
          <span>Offline Edge Processing</span>
        </div>
        <p className="max-w-xl mx-auto text-[11px] leading-relaxed text-[var(--muted)]">
          Fitness Intelligence is strictly for educational, fitness, and wellness tracking. All biometric calculations are estimates based on validated population formulas and should be verified with a qualified physician or certified specialist.
        </p>
      </div>

      {/* Safety Re-screening Modal */}
      <Modal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        title="Update Health & Safety Screening"
        description="Re-screen your joint limitations or medical status to adjust contraindicated exercises."
        maxWidth="lg"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSafetyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={saving}
              onClick={handleSaveSafety}
            >
              Apply Safety Rules
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] cursor-pointer">
              <input
                type="checkbox"
                checked={safetyDraft.injuryOrPain}
                onChange={(e) =>
                  setSafetyDraft({
                    ...safetyDraft,
                    injuryOrPain: e.target.checked,
                    injuryAreas: e.target.checked ? safetyDraft.injuryAreas : [],
                  })
                }
                className="mt-1 accent-[#FF6B1A] rounded w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-semibold text-[var(--text)] block">
                  Joint, muscle, or tendon pain/niggly areas
                </span>
                <span className="text-[var(--muted)]">
                  Flags exercises putting direct mechanical strain on injured joints.
                </span>
              </div>
            </label>

            {safetyDraft.injuryOrPain && (
              <div className="pl-6 pt-1 space-y-2">
                <span className="text-xs text-[var(--muted)] block">
                  Select affected joint areas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['knee', 'shoulder', 'lower_back', 'wrist'] as const).map((joint) => {
                    const isSelected = safetyDraft.injuryAreas?.includes(joint);
                    return (
                      <Chip
                        key={joint}
                        label={joint.replace('_', ' ').toUpperCase()}
                        selected={isSelected}
                        size="sm"
                        onClick={() => {
                          const current = safetyDraft.injuryAreas || [];
                          const updated = isSelected
                            ? current.filter((j: string) => j !== joint)
                            : [...current, joint];
                          setSafetyDraft({ ...safetyDraft, injuryAreas: updated });
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <label className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] cursor-pointer">
              <input
                type="checkbox"
                checked={safetyDraft.diagnosedCardiovascularOrBP}
                onChange={(e) =>
                  setSafetyDraft({
                    ...safetyDraft,
                    diagnosedCardiovascularOrBP: e.target.checked,
                  })
                }
                className="mt-1 accent-[#FF6B1A] rounded w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-semibold text-[var(--text)] block">
                  Diagnosed cardiovascular condition or high blood pressure
                </span>
                <span className="text-[var(--muted)]">
                  Requires medical clearance; sets safety status to Amber or Red.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] cursor-pointer">
              <input
                type="checkbox"
                checked={safetyDraft.recentSurgery}
                onChange={(e) =>
                  setSafetyDraft({
                    ...safetyDraft,
                    recentSurgery: e.target.checked,
                  })
                }
                className="mt-1 accent-[#FF6B1A] rounded w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-semibold text-[var(--text)] block">
                  Recent surgery or medical intervention (past 6 months)
                </span>
                <span className="text-[var(--muted)]">
                  Restricts high-intensity compound resistance exercises.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] cursor-pointer">
              <input
                type="checkbox"
                checked={safetyDraft.concerningSymptomsDuringExercise}
                onChange={(e) =>
                  setSafetyDraft({
                    ...safetyDraft,
                    concerningSymptomsDuringExercise: e.target.checked,
                  })
                }
                className="mt-1 accent-[#FF6B1A] rounded w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-semibold text-[var(--text)] block">
                  Chest pain, irregular heartbeat, or dizziness during exertion
                </span>
                <span className="text-rose-500 dark:text-rose-400 font-medium">
                  Triggers immediate RED tier: resistance training is locked until professional physician signoff.
                </span>
              </div>
            </label>
          </div>

          {/* Realtime Safety Preview */}
          <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs flex items-center justify-between">
            <span className="text-[var(--muted)]">Preview Resulting Tier:</span>
            <span
              className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                previewSafety.tier === 'green'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : previewSafety.tier === 'amber'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'bg-red-500/20 text-red-600 dark:text-red-400'
              }`}
            >
              {previewSafety.tier}
            </span>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Wipe All Local Storage Data?"
        description="This action cannot be undone. All your workout history, food logs, body biometrics, and personalized plans stored on this device will be permanently erased."
        maxWidth="md"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteAllData}
            >
              <span className="flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" /> Yes, Permanently Delete All Data
              </span>
            </Button>
          </>
        }
      >
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Permanent Data Deletion</span>
          </div>
          <p>
            Because Fitness Intelligence runs in pure client-side mode with zero server sync, deleted data cannot be recovered by any support team.
          </p>
        </div>
      </Modal>

      {/* Log Out Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Log Out of Session?"
        description="Are you sure you want to log out? Your personal biometrics, workouts, and nutrition logs will remain safely stored on this device."
        maxWidth="md"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
            >
              <span className="flex items-center gap-1.5">
                <LogOut className="w-4 h-4" /> Yes, Log Out
              </span>
            </Button>
          </>
        }
      >
        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text)] space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <User className="w-4 h-4 text-[#FF6B1A] shrink-0" />
            <span>
              Active Session:{' '}
              <strong className="text-[var(--text)]">
                {name || profile.name || 'User'}
              </strong>
              {profile.email ? ` (${profile.email})` : ''}
            </span>
          </div>
          <p className="text-[var(--muted)]">
            Logging out closes your current active profile session. You will be safely returned to the landing page and can sign back in at any time.
          </p>
        </div>
      </Modal>
    </div>
  );
};
