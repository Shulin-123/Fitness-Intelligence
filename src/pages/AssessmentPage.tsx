import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Flame,
  Droplet,
  Dumbbell,
  ArrowRight,
  AlertOctagon,
  Scale,
  ShieldCheck,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { SafetyBanner } from '../components/ui/SafetyBanner';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { SafeSplitSelector } from '../components/workout/SafeSplitSelector';
import { evaluateClinicalResearchSafety } from '../engine/clinicalSafetyResearch';
import { useWhyDrawer } from '../context/WhyDrawerContext';
import { useToast } from '../context/ToastContext';
import { services, type AssessmentResult } from '../services/registry';
import type { UserProfile, WeeklyPlan } from '../types';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { openDrawer } = useWhyDrawer();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [changingSplit, setChangingSplit] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await services.profile.getProfile();
      if (!p) {
        navigate('/onboarding');
        return;
      }
      setProfile(p);
      const res = services.assessment.calculateAssessment(p);
      setAssessment(res);

      if (res.safety.tier !== 'red') {
        const generatedPlan = await services.plan.generateAndSavePlan(p);
        setPlan(generatedPlan);
      } else {
        setPlan(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not compute assessment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectSafeSplit = async (splitId: string) => {
    if (!profile) return;
    setChangingSplit(true);
    try {
      const updated = await services.profile.updateProfile({ selectedSafeSplitId: splitId });
      setProfile(updated);
      const newPlan = await services.plan.generateAndSavePlan(updated, splitId);
      setPlan(newPlan);
      showToast('Activated condition-safe training split!', 'success');
    } catch (err: unknown) {
      showToast('Could not change split. Please try again.', 'error');
    } finally {
      setChangingSplit(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      </div>
    );
  }

  if (error || !profile || !assessment) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <ErrorState
          title="Assessment Computation Error"
          message={error || 'Unable to load profile data.'}
          onRetry={loadData}
        />
      </div>
    );
  }

  const isRed = assessment.safety.tier === 'red';
  const clinicalReport = profile ? evaluateClinicalResearchSafety(profile) : null;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B1A]/10 text-xs font-semibold text-[#FF6B1A] mb-2 animate-pulse">
          <span>BIOENERGETIC AUDIT COMPLETE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[var(--text)] tracking-tight">
          Your Personalized Assessment
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1.5 max-w-2xl leading-relaxed">
          Calibrated using peer-reviewed physiological formulas. Every number is an estimate with full algorithmic transparency.
        </p>
      </div>

      {/* Safety Status Banner (Green / Amber / Red) */}
      <SafetyBanner
        tier={assessment.safety.tier}
        reasons={assessment.safety.reasons}
        explanation={assessment.safety.explanation}
      />

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* BMI */}
        <StatCard
          label="Body Mass Index"
          value={assessment.bmi.value.bmi}
          sublabel={assessment.bmi.value.label}
          explanation={assessment.bmi.explanation}
          icon={<Scale className="w-4 h-4" />}
        />

        {/* Target Daily Calories (labeled "estimate") */}
        <StatCard
          label="Estimated Daily Energy"
          value={assessment.goalCalories.value.toLocaleString()}
          unit="kcal / day"
          sublabel={isRed ? 'Maintenance energy (No deficit)' : 'Target intake estimate'}
          explanation={assessment.goalCalories.explanation}
          icon={<Flame className="w-4 h-4" />}
          accent
        />

        {/* Protein Target */}
        <StatCard
          label="Protein Target"
          value={assessment.macros.value.proteinGrams}
          unit="g / day"
          sublabel={`${assessment.macros.value.proteinPercentage}% of total calories`}
          explanation={assessment.macros.explanation}
          icon={<Activity className="w-4 h-4" />}
        />

        {/* Water Target */}
        <StatCard
          label="Hydration Baseline"
          value={(assessment.waterTarget.value / 1000).toFixed(1)}
          unit="L / day"
          sublabel="~35 ml/kg active index"
          explanation={assessment.waterTarget.explanation}
          icon={<Droplet className="w-4 h-4" />}
        />
      </div>

      {/* Macronutrient Partitioning Card */}
      <Card variant="default" className="p-6 border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--text)] tracking-tight">
              Macronutrient Target Partitioning
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Optimized for {profile.goal.replace('_', ' ')} and lean tissue preservation
            </p>
          </div>
          <button
            onClick={() =>
              openDrawer({
                title: 'Macronutrient Partitioning',
                valueDisplay: `${assessment.macros.value.proteinGrams}g P / ${assessment.macros.value.carbGrams}g C / ${assessment.macros.value.fatGrams}g F`,
                explanation: assessment.macros.explanation,
              })
            }
            className="text-xs text-[#FF6B1A] hover:underline font-semibold cursor-pointer"
          >
            Why this?
          </button>
        </div>

        {/* Macro Progress Bar */}
        <div className="h-3 w-full bg-[var(--surface-2)] rounded-full overflow-hidden flex">
          <div
            style={{ width: `${assessment.macros.value.proteinPercentage}%` }}
            className="h-full bg-[#FF6B1A]"
            title={`Protein ${assessment.macros.value.proteinPercentage}%`}
          />
          <div
            style={{ width: `${assessment.macros.value.carbPercentage}%` }}
            className="h-full bg-[#FFB547]"
            title={`Carbs ${assessment.macros.value.carbPercentage}%`}
          />
          <div
            style={{ width: `${assessment.macros.value.fatPercentage}%` }}
            className="h-full bg-[#FFE3C4]"
            title={`Fat ${assessment.macros.value.fatPercentage}%`}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 text-center">
          <div className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)]">
            <span className="text-[11px] font-bold text-[#FF6B1A] uppercase tracking-wider block">
              Protein
            </span>
            <span className="text-lg font-bold text-[var(--text)] tabular-nums">
              {assessment.macros.value.proteinGrams}g
            </span>
            <span className="text-[10px] text-[var(--muted)] block">
              {assessment.macros.value.proteinPercentage}% ({assessment.macros.value.proteinGrams * 4} kcal)
            </span>
          </div>

          <div className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)]">
            <span className="text-[11px] font-bold text-[#FFB547] uppercase tracking-wider block">
              Carbohydrates
            </span>
            <span className="text-lg font-bold text-[var(--text)] tabular-nums">
              {assessment.macros.value.carbGrams}g
            </span>
            <span className="text-[10px] text-[var(--muted)] block">
              {assessment.macros.value.carbPercentage}% ({assessment.macros.value.carbGrams * 4} kcal)
            </span>
          </div>

          <div className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)]">
            <span className="text-[11px] font-bold text-[#D97706] dark:text-[#FFE3C4] uppercase tracking-wider block">
              Dietary Fats
            </span>
            <span className="text-lg font-bold text-[var(--text)] tabular-nums">
              {assessment.macros.value.fatGrams}g
            </span>
            <span className="text-[10px] text-[var(--muted)] block">
              {assessment.macros.value.fatPercentage}% ({assessment.macros.value.fatGrams * 9} kcal)
            </span>
          </div>
        </div>
      </Card>

      {/* Evidence-Based Clinical Safety & Research Screening */}
      {clinicalReport && (
        <Card variant="default" className="p-6 md:p-8 border-[var(--border)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-[#FF6B1A]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B1A]">
                  Clinical Research & Evidence-Based Audit
                </span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text)] tracking-tight">
                Movement Safety & Clinical Screening
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
                Grounded strictly in CDC Chronic Health Guidelines, PAR-Q+ Protocols, and ACSM Exercise Contraindications.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  clinicalReport.overallTier === 'red'
                    ? 'bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/30'
                    : clinicalReport.overallTier === 'amber'
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30'
                }`}
              >
                {clinicalReport.overallTier.toUpperCase()} SAFETY TIER
              </span>
            </div>
          </div>

          {/* Uploaded Medical Report Summary (if present) */}
          {profile.safetyResponses.uploadedReport && (
            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[#FF6B1A]/30 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[var(--text)]">
                  <FileText className="w-4 h-4 text-[#FF6B1A]" />
                  <span className="text-xs font-bold">Uploaded Medical Report:</span>
                  <span className="text-xs font-mono text-[var(--muted)]">
                    {profile.safetyResponses.uploadedReport.fileName}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--muted)]">
                  Analyzed via Web Crypto & NLP Sandbox
                </span>
              </div>

              {profile.safetyResponses.uploadedReport.detectedKeywords &&
                profile.safetyResponses.uploadedReport.detectedKeywords.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--muted)]">
                      Detected Restrictions:
                    </span>
                    {profile.safetyResponses.uploadedReport.detectedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FF6B1A]/20 text-[#EA580C] dark:text-[#FF6B1A] border border-[#FF6B1A]/30"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* Clinical Findings Grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Verified Research Findings ({clinicalReport.findings.length})
            </h4>

            <div className="grid grid-cols-1 gap-4">
              {clinicalReport.findings.map((finding, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[var(--text)]">
                        {finding.source}
                      </span>
                      <h5 className="text-sm font-bold text-[var(--text)]">{finding.condition}</h5>
                    </div>

                    <a
                      href={finding.citationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6B1A] hover:underline"
                    >
                      <span>{finding.citationTitle}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    {finding.recommendation}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    {/* Contraindications */}
                    {finding.contraindications.length > 0 && (
                      <div className="p-3 rounded-lg bg-[var(--surface)] border border-red-500/20 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 block flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Restricted Contraindications
                        </span>
                        <ul className="space-y-1">
                          {finding.contraindications.map((contra, cIdx) => (
                            <li key={cIdx} className="text-[11px] text-[var(--text)]/80 flex items-start gap-1.5">
                              <span className="text-red-500 dark:text-red-400">•</span>
                              <span>{contra}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Safe Alternatives */}
                    {finding.safeAlternatives.length > 0 && (
                      <div className="p-3 rounded-lg bg-[var(--surface)] border border-green-500/20 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-[#22C55E] block flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Safe Evidence-Based Alternatives
                        </span>
                        <ul className="space-y-1">
                          {finding.safeAlternatives.map((alt, aIdx) => (
                            <li key={aIdx} className="text-[11px] text-[var(--text)]/80 flex items-start gap-1.5">
                              <span className="text-green-600 dark:text-[#22C55E]">•</span>
                              <span>{alt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Safe Split Selector */}
      {!isRed && plan?.availableSafeSplits && plan.availableSafeSplits.length > 0 && (
        <SafeSplitSelector
          splits={plan.availableSafeSplits}
          currentSplitId={plan.safeSplitId}
          onSelectSplit={handleSelectSafeSplit}
          isChanging={changingSplit}
        />
      )}

      {/* Plan Summary OR Red Alert Message */}
      {isRed ? (
        <Card variant="surface2" className="p-6 md:p-8 border-red-500/40 bg-red-950/20 text-center space-y-4">
          <div className="p-3.5 bg-red-500/20 text-red-400 rounded-2xl mx-auto w-fit">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Workout Generated for Safety</h3>
          <p className="text-sm text-red-200/90 max-w-xl mx-auto leading-relaxed">
            Due to exertional symptoms (chest pain, syncope, or severe breathlessness), automated exercise plans are withheld. Please seek clinical evaluation. Nutrition tracking remains accessible in maintenance equilibrium.
          </p>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/dashboard')}
            className="border-red-500/30 text-red-300 hover:bg-red-500/10 cursor-pointer"
          >
            Access Nutrition & Hydration Only
          </Button>
        </Card>
      ) : plan ? (
        <Card variant="default" className="p-6 md:p-8 border-[var(--border)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="w-4 h-4 text-[#FF6B1A]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B1A]">
                  {plan.volumeTier === 'amber_reduced' ? 'Amber Calibrated Plan' : 'Personalized Split'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text)] tracking-tight">{plan.splitName}</h3>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">{plan.splitDescription}</p>
            </div>

            <button
              onClick={() =>
                openDrawer({
                  title: plan.splitName,
                  valueDisplay: `${plan.daysPerWeek} Days / Week`,
                  explanation: plan.explanation,
                })
              }
              className="text-xs text-[#FF6B1A] hover:underline font-semibold cursor-pointer self-start sm:self-auto"
            >
              Why this plan?
            </button>
          </div>

          {/* Days preview grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {plan.days.map((day) => (
              <div
                key={day.dayNumber}
                className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    Day {day.dayNumber}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[var(--muted)]">
                    {day.targetDurationMin} min
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[var(--text)]">{day.title}</h4>
                <div className="flex flex-wrap gap-1 pt-1">
                  {day.focusMuscles.map((m) => (
                    <span
                      key={m}
                      className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[var(--muted)]"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Action CTA */}
      <div className="flex justify-end pt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <span>Enter Dashboard</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
