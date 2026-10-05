import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'lime' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#FF6B1A] focus-visible:outline-offset-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none active:scale-[0.98]';

    // Sports-tech rules: Primary CTA solid orange #FF6B1A with DARK text #0F0B09. Never white text on orange.
    const variants = {
      primary:
        'bg-[#FF6B1A] text-[#0F0B09] hover:bg-[#FF8A3D] active:bg-[#E04E00] rounded-[4px] font-bold tracking-tight',
      lime:
        'bg-[#FF6B1A] text-[#0F0B09] hover:bg-[#FF8A3D] active:bg-[#E04E00] rounded-[4px] font-bold tracking-tight',
      secondary:
        'bg-transparent text-[var(--text)] hover:bg-[var(--surface-2)] border border-[var(--border)] rounded-[4px] font-medium',
      outline:
        'bg-transparent text-[var(--text)] hover:bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#FF6B1A]/40 rounded-[4px] font-medium',
      ghost:
        'bg-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-[4px]',
      danger:
        'bg-[#F87171]/10 text-[#F87171] hover:bg-[#F87171]/20 border border-[#F87171]/30 rounded-[4px]',
    };

    // Ensure 44px minimum touch targets
    const sizes = {
      sm: 'min-h-[40px] px-3.5 py-1.5 text-xs tracking-wide',
      md: 'min-h-[44px] px-5 py-2.5 text-sm tracking-tight',
      lg: 'min-h-[50px] px-7 py-3.5 text-base tracking-tight',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            {/* Small looping ember-ring loader */}
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
