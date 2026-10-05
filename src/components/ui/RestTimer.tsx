import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Bell } from 'lucide-react';
import { Ring } from './Ring';

export interface RestTimerProps {
  initialSeconds?: number;
  onComplete?: () => void;
  className?: string;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds = 90,
  onComplete,
  className = '',
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            setIsFinished(true);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, remainingSeconds, onComplete]);

  const toggleTimer = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(totalSeconds);
      setIsFinished(false);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setRemainingSeconds(totalSeconds);
    setIsFinished(false);
  };

  const add30Seconds = () => {
    setTotalSeconds((prev) => prev + 30);
    setRemainingSeconds((prev) => prev + 30);
    setIsFinished(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div
      className={`p-4 md:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isFinished ? 'border-[#FF6B1A] shadow-[0_0_20px_rgba(255,107,26,0.2)] animate-pulse' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Ring
            value={totalSeconds - remainingSeconds}
            target={totalSeconds}
            size={76}
            strokeWidth={6}
            color={isFinished ? '#22C55E' : '#FF6B1A'}
            sublabel={isFinished ? 'GO' : formatTime(remainingSeconds)}
          />
          {isFinished && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Bell className="w-5 h-5 text-[#22C55E] animate-bounce" />
            </div>
          )}
        </div>

        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[var(--muted)] block">
            Inter-Set Rest Interval
          </span>
          <span className="text-xl font-light text-[var(--text)] tabular-nums tracking-tight">
            {formatTime(remainingSeconds)}
          </span>
          <span className="text-xs text-[var(--muted)] block">
            {isFinished
              ? 'Rest complete! Ready for next set.'
              : isActive
              ? 'Resting...'
              : 'Paused'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTimer}
          className={`p-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 min-h-[44px] min-w-[44px] cursor-pointer ${
            isActive
              ? 'bg-[var(--surface-2)] text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/10 border border-[var(--border)]'
              : 'bg-[#FF6B1A] text-white font-bold hover:bg-[#FF8A3D]'
          }`}
          aria-label={isActive ? 'Pause rest timer' : 'Start rest timer'}
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isActive ? 'Pause' : 'Start'}</span>
        </button>

        <button
          type="button"
          onClick={add30Seconds}
          className="p-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] text-xs font-semibold flex items-center gap-1 min-h-[44px] cursor-pointer"
          aria-label="Add 30 seconds to rest interval"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>30s</span>
        </button>

        <button
          type="button"
          onClick={resetTimer}
          className="p-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] text-xs min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Reset rest interval"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
