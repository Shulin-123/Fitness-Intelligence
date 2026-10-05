import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';
import type { SafetyTier, SafetyReason, Explanation } from '../../types';
import { useWhyDrawer } from '../../context/WhyDrawerContext';

export interface SafetyBannerProps {
  tier: SafetyTier;
  reasons?: SafetyReason[];
  explanation?: Explanation;
  className?: string;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({
  tier,
  reasons = [],
  explanation,
  className = '',
}) => {
  const { openDrawer } = useWhyDrawer();

  const handleWhyClick = () => {
    if (explanation) {
      openDrawer({
        title: `Safety Stratification: ${tier.toUpperCase()}`,
        valueDisplay: `${tier.toUpperCase()} TIER`,
        explanation,
      });
    }
  };

  if (tier === 'red') {
    return (
      <div
        role="alert"
        className={`p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/40 text-red-900 dark:text-red-200 ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl shrink-0 mt-0.5">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  RED TIER
                </span>
                <span className="text-xs text-red-700 dark:text-red-300 font-semibold">
                  Exercise Contraindicated
                </span>
              </div>
              <h3 className="text-base font-bold text-[var(--text)] dark:text-white mt-1">
                Medical Clearance Required Prior to Training
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200/90 mt-1.5 leading-relaxed">
                Based on your reported symptoms (e.g. chest pain, fainting, or severe breathlessness), automated exercise plans have been suspended. For your safety, please seek consultation with a qualified medical professional before engaging in vigorous physical activity.
              </p>

              {reasons.length > 0 && (
                <div className="mt-3.5 space-y-1.5 pt-3 border-t border-red-200 dark:border-red-500/20">
                  {reasons.map((r, i) => (
                    <div key={i} className="text-xs text-red-800 dark:text-red-300/90 flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>{r.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {explanation && (
            <button
              onClick={handleWhyClick}
              className="shrink-0 p-2 text-red-600 dark:text-red-300 hover:text-red-950 dark:hover:text-white rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors cursor-pointer"
              aria-label="Why this red safety determination?"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (tier === 'amber') {
    return (
      <div
        role="status"
        className={`p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/35 text-amber-900 dark:text-amber-200 ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  AMBER TIER
                </span>
                <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold">
                  Calibrated Lower-Risk Protocol
                </span>
              </div>
              <h3 className="text-base font-bold text-[var(--text)] dark:text-white mt-1">
                Specialized Joint & Load Adjustments Active
              </h3>
              <p className="text-sm text-amber-850 dark:text-amber-200/90 mt-1.5 leading-relaxed">
                Your workout programming has been calibrated with stable machine variations, capped RPE intensities, and joint-protective substitutions. Please confirm suitability with a qualified medical or exercise professional.
              </p>

              {reasons.length > 0 && (
                <div className="mt-3.5 space-y-1.5 pt-3 border-t border-amber-200 dark:border-amber-500/20">
                  {reasons.map((r, i) => (
                    <div key={i} className="text-xs text-amber-800 dark:text-amber-300/90 flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>{r.message} {r.detail && `— ${r.detail}`}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {explanation && (
            <button
              onClick={handleWhyClick}
              className="shrink-0 p-2 text-amber-600 dark:text-amber-300 hover:text-amber-950 dark:hover:text-white rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors cursor-pointer"
              aria-label="Why this amber safety status?"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // GREEN
  return (
    <div
      role="status"
      className={`p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                GREEN TIER
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                Standard Protocol
              </span>
            </div>
            <p className="text-sm text-[var(--text)] dark:text-white/90 mt-0.5">
              No exercise contraindications flagged. Standard progressive overload training protocol enabled.
            </p>
          </div>
        </div>

        {explanation && (
          <button
            onClick={handleWhyClick}
            className="shrink-0 p-2 text-emerald-600 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors cursor-pointer"
            aria-label="Why this green safety status?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
