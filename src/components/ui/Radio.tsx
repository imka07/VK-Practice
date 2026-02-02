import React from 'react';
import { cn } from '@/lib/utils/cn';

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="radio"
          className={cn(
            'h-4 w-4 cursor-pointer',
            'border-gray-300 text-primary-600',
            'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:bg-gray-100',
            className
          )}
          {...props}
        />
        {label && (
          <label
            className={cn(
              'ml-2 text-sm text-gray-700 cursor-pointer select-none',
              props.disabled && 'text-gray-400 cursor-not-allowed'
            )}
            onClick={(e) => {
              if (!props.disabled) {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                input?.click();
              }
            }}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

interface RadioGroupProps {
  label?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  error,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="space-y-2">{children}</div>
      {error && (
        <p className="text-sm text-error-600">{error}</p>
      )}
    </div>
  );
};
