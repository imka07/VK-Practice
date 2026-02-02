import React from 'react';
import { cn } from '@/lib/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  return (
    <div
      className={cn(
        'inline-block rounded-full border-solid',
        'border-current border-r-transparent',
        'animate-spin',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Загрузка"
    >
      <span className="sr-only">Загрузка...</span>
    </div>
  );
};

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  text = 'Загрузка...',
  size = 'md',
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Spinner size={size} className="text-primary-600" />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
};
