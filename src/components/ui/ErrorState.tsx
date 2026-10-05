import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something unexpected occurred',
  message = 'We could not complete this calculation or load your data. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`p-6 md:p-8 rounded-2xl bg-red-950/20 border border-red-500/25 text-center flex flex-col items-center justify-center max-w-md mx-auto ${className}`}
    >
      <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-xs md:text-sm text-red-200/80 mb-5 leading-relaxed max-w-sm">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-red-500/30 text-red-300 hover:bg-red-500/10 flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </Button>
      )}
    </div>
  );
};
