import React from 'react';
import { Card } from './Card';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  ariaDescription?: string;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  actions,
  children,
  ariaDescription,
  className = '',
}) => {
  return (
    <Card variant="default" className={`p-5 md:p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base md:text-lg font-semibold tracking-tight text-[var(--text)]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs md:text-sm text-[var(--muted)] mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div
        role="region"
        aria-label={`${title} chart`}
        aria-description={ariaDescription || subtitle}
        className="w-full overflow-hidden"
      >
        {children}
      </div>
    </Card>
  );
};
