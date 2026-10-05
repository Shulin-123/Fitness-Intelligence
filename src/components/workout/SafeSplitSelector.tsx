import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import type { SafeSplitOption } from '../../types';
import { Button } from '../ui/Button';

interface SafeSplitSelectorProps {
  splits: SafeSplitOption[];
  currentSplitId?: string;
  onSelectSplit: (splitId: string) => void | Promise<void>;
  isChanging?: boolean;
}

export const SafeSplitSelector: React.FC<SafeSplitSelectorProps> = ({
  splits,
  currentSplitId,
  onSelectSplit,
  isChanging = false,
}) => {
  const [expandedSplitId, setExpandedSplitId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSplitId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF6B1A]/10 text-[#FF6B1A] text-[11px] font-semibold tracking-wide uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Clinical Safe Split Selector</span>
          </div>
          <h3 className="text-xl font-bold text-[var(--text)] tracking-tight mt-1">
            Choose Your Condition-Safe Training Split
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
            Every split automatically adjusts contraindicated movements, machine stabilization, and intensity caps.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {splits.map((split) => {
          const isSelected = split.id === currentSplitId;
          const isExpanded = expandedSplitId === split.id;

          return (
            <div
              key={split.id}
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'bg-[var(--surface-2)] border-[#FF6B1A] shadow-lg shadow-[#FF6B1A]/10 ring-1 ring-[#FF6B1A]'
                  : 'bg-[var(--surface)] border-[var(--border)] hover:border-[#FF6B1A]/40'
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Header tags */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]">
                    {split.badgeLabel}
                  </span>

                  {split.isRecommended && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 shrink-0">
                      <Sparkles className="w-3 h-3" />
                      Recommended
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-base font-bold text-[var(--text)] tracking-tight">
                    {split.name}
                  </h4>
                  <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                    {split.description}
                  </p>
                </div>

                {/* Cadence & RPE specs */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">
                      Frequency
                    </span>
                    <span className="text-sm font-bold text-[var(--text)] tabular-nums">
                      {split.weeklyDays} Days / Week
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">
                      Intensity Ceiling
                    </span>
                    <span className="text-sm font-bold text-[#FF6B1A] tabular-nums">
                      RPE ≤ {split.rpeCap} (Cap)
                    </span>
                  </div>
                </div>

                {/* Day Templates preview */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                    Session Rotation
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {split.dayTemplates.map((template, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]"
                      >
                        {template}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Evidence-Based Exercise Substitutions */}
                {split.highlightedSubstitutions && split.highlightedSubstitutions.length > 0 && (
                  <div className="pt-2 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => toggleExpand(split.id)}
                      className="w-full flex items-center justify-between text-xs text-[#FF6B1A] hover:text-[#FFA066] font-semibold cursor-pointer py-1"
                    >
                      <span>
                        {isExpanded ? 'Hide' : 'View'} Vetted Safety Substitutions ({split.highlightedSubstitutions.length})
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="space-y-2 mt-2 pt-2 animate-in fade-in duration-150">
                        {split.highlightedSubstitutions.map((sub, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="line-through text-red-400 font-mono text-[11px]">
                                {sub.original}
                              </span>
                              <ArrowRight className="w-3 h-3 text-[var(--muted)]" />
                              <span className="text-[#22C55E] font-bold text-[11px]">
                                {sub.safeReplacement}
                              </span>
                            </div>
                            <p className="text-[10px] text-[var(--muted)] leading-snug">
                              {sub.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="p-4 bg-[var(--surface-2)] border-t border-[var(--border)]">
                {isSelected ? (
                  <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Active Training Split</span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold border-[#FF6B1A]/40 text-[var(--text)] hover:bg-[#FF6B1A] hover:text-[#0F0B09] transition-all cursor-pointer"
                    disabled={isChanging}
                    onClick={() => onSelectSplit(split.id)}
                  >
                    <span>Select & Activate This Split</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
