import React from 'react';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'why' | 'safety-green' | 'safety-amber' | 'safety-red';
  size?: 'sm' | 'md';
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onClick,
  icon,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const isInteractive = Boolean(onClick);

  const baseStyles =
    'inline-flex items-center gap-1.5 font-medium transition-all duration-150 rounded-full select-none focus-visible:outline-2 focus-visible:outline-[#FF6B1A]';

  const sizeStyles =
    size === 'sm'
      ? 'text-xs px-2.5 py-1 min-h-[32px]'
      : 'text-sm px-4 py-2 min-h-[44px]';

  let variantStyles = '';

  if (variant === 'why') {
    variantStyles =
      'bg-[var(--surface-2)] text-[#FF6B1A] hover:bg-[#FF6B1A]/10 border border-[#FF6B1A]/35 text-xs px-2.5 py-1 min-h-[30px] rounded-md tracking-tight cursor-pointer';
  } else if (variant === 'safety-green') {
    variantStyles = 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20';
  } else if (variant === 'safety-amber') {
    // Warning yellow #FACC15
    variantStyles = 'bg-[#FACC15]/10 text-amber-700 dark:text-[#FACC15] border border-amber-500/30 dark:border-[#FACC15]/25';
  } else if (variant === 'safety-red') {
    variantStyles = 'bg-[#F87171]/10 text-red-600 dark:text-[#F87171] border border-red-500/30 dark:border-[#F87171]/20';
  } else {
    // default chip: unselected = surface-2 + border; selected = orange at 14% alpha + orange border + text color
    variantStyles = selected
      ? 'bg-[#FF6B1A]/15 text-[var(--text)] border border-[#FF6B1A] shadow-[0_0_12px_rgba(255,107,26,0.20)] font-semibold'
      : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] border border-[var(--border)]';
  }

  const cursorStyle = isInteractive ? 'cursor-pointer active:scale-95' : 'cursor-default';

  return (
    <button
      type={isInteractive ? 'button' : undefined}
      onClick={onClick}
      disabled={!isInteractive}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${cursorStyle} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
