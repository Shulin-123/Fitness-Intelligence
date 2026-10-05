import React from 'react';
import { Check } from 'lucide-react';
import type { LoggedSet } from '../../types';

export interface SetLoggerProps {
  sets: LoggedSet[];
  onSetChange: (setIdx: number, field: 'weightKg' | 'reps' | 'completed', value: number | boolean) => void;
  onAddSet?: () => void;
  targetRepsHint?: string;
}

export const SetLogger: React.FC<SetLoggerProps> = ({
  sets,
  onSetChange,
  onAddSet,
  targetRepsHint,
}) => {
  return (
    <div className="w-full space-y-2">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] px-2">
        <span className="col-span-2 text-center">Set</span>
        <span className="col-span-4 text-center">Weight (kg)</span>
        <span className="col-span-4 text-center">Reps {targetRepsHint ? `(${targetRepsHint})` : ''}</span>
        <span className="col-span-2 text-center">Done</span>
      </div>

      {/* Set rows */}
      {sets.map((set, idx) => (
        <div
          key={idx}
          className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-colors ${
            set.completed
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-[var(--surface-2)] border-[var(--border)]'
          }`}
        >
          {/* Set Number */}
          <div className="col-span-2 text-center">
            <span className="text-xs font-bold text-[var(--text)] tabular-nums">
              {set.setNumber}
            </span>
          </div>

          {/* Weight Input */}
          <div className="col-span-4">
            <input
              type="number"
              step="0.5"
              min="0"
              value={set.weightKg === 0 ? '' : set.weightKg}
              onChange={(e) =>
                onSetChange(idx, 'weightKg', parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              className="w-full text-center bg-[var(--surface)] border border-[var(--border)] rounded-lg py-2 text-sm font-semibold tabular-nums text-[var(--text)] focus:border-[#FF6B1A] focus:outline-none min-h-[40px]"
              aria-label={`Set ${set.setNumber} weight in kilograms`}
            />
          </div>

          {/* Reps Input */}
          <div className="col-span-4">
            <input
              type="number"
              min="0"
              value={set.reps === 0 ? '' : set.reps}
              onChange={(e) =>
                onSetChange(idx, 'reps', parseInt(e.target.value, 10) || 0)
              }
              placeholder="0"
              className="w-full text-center bg-[var(--surface)] border border-[var(--border)] rounded-lg py-2 text-sm font-semibold tabular-nums text-[var(--text)] focus:border-[#FF6B1A] focus:outline-none min-h-[40px]"
              aria-label={`Set ${set.setNumber} completed reps`}
            />
          </div>

          {/* Checkmark Button */}
          <div className="col-span-2 flex justify-center">
            <button
              type="button"
              onClick={() => onSetChange(idx, 'completed', !set.completed)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer min-h-[36px] min-w-[36px] focus-visible:outline-2 focus-visible:outline-[#FF6B1A] ${
                set.completed
                  ? 'bg-[#22C55E] text-white shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                  : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--muted)] hover:text-[var(--text)]'
              }`}
              aria-label={`Mark set ${set.setNumber} as ${set.completed ? 'incomplete' : 'complete'}`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      ))}

      {onAddSet && (
        <button
          type="button"
          onClick={onAddSet}
          className="w-full py-2.5 mt-2 border border-dashed border-[var(--border)] hover:border-black/30 dark:hover:border-white/30 rounded-xl text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
        >
          + Add Extra Set
        </button>
      )}
    </div>
  );
};
