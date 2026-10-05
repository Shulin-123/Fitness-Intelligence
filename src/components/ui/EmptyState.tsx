import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`p-8 md:p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col items-center justify-center max-w-md mx-auto ${className}`}
    >
      {icon && (
        <div className="p-4 rounded-2xl bg-[var(--surface-2)] text-[var(--muted)] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold tracking-tight text-[var(--text)] mb-1.5">{title}</h3>
      <p className="text-sm text-[var(--muted)] leading-relaxed mb-6 max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
