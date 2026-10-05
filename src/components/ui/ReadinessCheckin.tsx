import React, { useState } from 'react';
import { Moon, Zap, Shield, HelpCircle, Check } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { calculateReadiness } from '../../engine/rules';
import { useWhyDrawer } from '../../context/WhyDrawerContext';
import type { ReadinessAdjustmentType, Explanation } from '../../types';

export interface ReadinessCheckinProps {
  currentAdjustment?: ReadinessAdjustmentType;
  currentScore?: number;
  explanation?: Explanation;
  onSubmit: (sleep: number, soreness: number, energy: number) => Promise<void>;
  className?: string;
}

export const ReadinessCheckin: React.FC<ReadinessCheckinProps> = ({
  currentAdjustment,
  currentScore,
  explanation: existingExplanation,
  onSubmit,
  className = '',
}) => {
  const [sleep, setSleep] = useState<number>(4);
  const [soreness, setSoreness] = useState<number>(2);
  const [energy, setEnergy] = useState<number>(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!currentScore);

  const { openDrawer } = useWhyDrawer();

  const preview = calculateReadiness(sleep, soreness, energy);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(sleep, soreness, energy);
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const activeExpl = existingExplanation || preview.explanation;
    openDrawer({
      title: 'Daily Readiness & Autoregulation',
      valueDisplay: `${currentScore || preview.value.score}/100`,
      explanation: activeExpl,
    });
  };

  const adjustmentLabels: Record<ReadinessAdjustmentType, { label: string; color: string; desc: string }> = {
    keep: {
      label: 'Full Scheduled Volume',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      desc: 'Optimal readiness. All scheduled working sets proceed normally.',
    },
    reduce_volume: {
      label: 'Reduced Volume (-30% Sets)',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      desc: 'Recovery debt detected. Sets scaled down ~30% to protect joints.',
    },
    active_recovery: {
      label: 'Active Recovery Protocol',
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      desc: 'High systemic fatigue. Light mobility recommended instead of heavy loading.',
    },
  };

  const activeAdj = currentAdjustment || preview.value.adjustment;
  const activeAdjMeta = adjustmentLabels[activeAdj];

  return (
    <Card variant="default" className={`p-5 md:p-6 border-[var(--border)] ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B1A]">
              Daily Autoregulation
            </span>
            <button
              type="button"
              onClick={handleWhyClick}
              className="text-[var(--muted)] hover:text-[#FF6B1A] transition-colors p-1 cursor-pointer"
              aria-label="Why this readiness adjustment?"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <h3 className="text-lg font-bold text-[var(--text)] tracking-tight">
            Readiness & Joint Check-in
          </h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            3-tap check-in that adapts today's workout volume to your systemic fatigue
          </p>
        </div>

        {currentScore !== undefined && !isExpanded && (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-xs text-[var(--muted)] block">Score</span>
              <span className="text-lg font-bold text-[var(--text)] tabular-nums">
                {currentScore}/100
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="text-xs"
            >
              Update
            </Button>
          </div>
        )}
      </div>

      {/* Status banner when collapsed */}
      {!isExpanded && currentScore !== undefined && (
        <div className={`mt-4 p-3.5 rounded-xl border flex items-center justify-between text-xs ${activeAdjMeta.color}`}>
          <div>
            <span className="font-bold block uppercase tracking-wide">
              Today's Session: {activeAdjMeta.label}
            </span>
            <span className="opacity-90">{activeAdjMeta.desc}</span>
          </div>
        </div>
      )}

      {/* Expanded 3-tap interactive sliders */}
      {isExpanded && (
        <div className="mt-5 space-y-5 pt-4 border-t border-[var(--border)]">
          {/* 1. Sleep */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-[var(--text)] flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sleep Quality & Restfulness</span>
              </span>
              <span className="text-[var(--muted)] font-medium">
                {sleep === 1
                  ? 'Terrible (<5 hrs)'
                  : sleep === 2
                  ? 'Restless'
                  : sleep === 3
                  ? 'Average (~6-7 hrs)'
                  : sleep === 4
                  ? 'Good rest'
                  : 'Deep & fully refreshed (8+ hrs)'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSleep(val)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                    sleep === val
                      ? 'bg-[#FF6B1A] text-white font-bold shadow-md'
                      : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Soreness */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-[var(--text)] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Muscle & Joint Soreness</span>
              </span>
              <span className="text-[var(--muted)] font-medium">
                {soreness === 1
                  ? 'None (fresh)'
                  : soreness === 2
                  ? 'Mild tightness'
                  : soreness === 3
                  ? 'Moderate DOMS'
                  : soreness === 4
                  ? 'High soreness'
                  : 'Extreme fatigue/pain'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSoreness(val)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                    soreness === val
                      ? 'bg-[#FF6B1A] text-white font-bold shadow-md'
                      : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Energy */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-[var(--text)] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#FF6B1A]" />
                <span>Physical Energy & Motivation</span>
              </span>
              <span className="text-[var(--muted)] font-medium">
                {energy === 1
                  ? 'Exhausted'
                  : energy === 2
                  ? 'Low drive'
                  : energy === 3
                  ? 'Normal'
                  : energy === 4
                  ? 'High energy'
                  : 'Fired up & peak power'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setEnergy(val)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                    energy === val
                      ? 'bg-[#FF6B1A] text-white font-bold shadow-md'
                      : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Preview Box */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs">
            <div>
              <span className="text-[var(--muted)] block">Forecasted Readiness</span>
              <span className="font-bold text-[var(--text)] text-sm tabular-nums">
                {preview.value.score}/100 • {adjustmentLabels[preview.value.adjustment].label}
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              className="flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Apply to Today's Workout</span>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
