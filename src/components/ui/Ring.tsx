import React from 'react';

export interface RingProps {
  value: number; // Current value
  target: number; // Target value
  size?: number; // Diameter in pixels
  strokeWidth?: number;
  color?: string; // Stroke color, default #FF6B1A
  trackColor?: string; // Track color, default surface-2 #1F1814
  useCalorieGradient?: boolean; // Gradient #FF4D00 -> #FFB547 around the ring
  label?: string;
  sublabel?: string;
  unit?: string;
  showPercent?: boolean;
  className?: string;
}

export const Ring: React.FC<RingProps> = ({
  value,
  target,
  size = 140,
  strokeWidth = 10,
  color = '#FF6B1A',
  trackColor = '#1F1814',
  useCalorieGradient = false,
  label,
  sublabel,
  unit = 'kcal',
  showPercent = false,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = target > 0 ? Math.min(100, Math.max(0, (value / target) * 100)) : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const gradientId = `ringGradient-${Math.round(size)}-${strokeWidth}`;

  const strokeColor = useCalorieGradient ? `url(#${gradientId})` : color;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={target}
      aria-label={label || 'Progress Meter'}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4D00" />
            <stop offset="100%" stopColor="#FFB547" />
          </linearGradient>
        </defs>

        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor || 'currentColor'}
          strokeWidth={strokeWidth}
          fill="none"
          className={trackColor ? '' : 'text-[var(--surface-2)]'}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        <span className="text-2xl md:text-3xl font-light tracking-tight tabular-nums text-[var(--text)]">
          {showPercent ? `${Math.round(percentage)}%` : value.toLocaleString()}
        </span>
        {sublabel ? (
          <span className="text-[11px] font-medium tracking-wide uppercase text-[var(--muted)] mt-0.5">
            {sublabel}
          </span>
        ) : unit ? (
          <span className="text-xs text-[var(--muted)]">
            / {target.toLocaleString()} {unit}
          </span>
        ) : null}
        {label && !sublabel && (
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF6B1A] mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
