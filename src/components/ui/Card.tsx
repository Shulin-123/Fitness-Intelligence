import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'surface2' | 'interactive' | 'glass';
  isHoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  isHoverable = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-[8px] transition-all duration-200';

  const variants = {
    default: 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]',
    surface2: 'bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text)]',
    interactive:
      'bg-[var(--surface)] border border-[var(--border)] hover:border-[#FF6B1A]/40 hover:bg-[var(--surface-hover)] text-[var(--text)] cursor-pointer',
    glass: 'glass-card text-[var(--text)]',
  };

  const hoverStyles = isHoverable
    ? 'hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
