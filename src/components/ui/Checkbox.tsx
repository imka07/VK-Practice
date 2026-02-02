import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'peer h-5 w-5 cursor-pointer appearance-none rounded border-2',
              'border-gray-300 bg-white transition-all',
              'checked:border-primary-600 checked:bg-primary-600',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-gray-200',
              error && 'border-error-500',
              className
            )}
            {...props}
          />
          <Check
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
          />
        </div>
        {label && (
          <label
            className={cn(
              'ml-2 text-sm text-gray-700 cursor-pointer select-none',
              props.disabled && 'text-gray-400 cursor-not-allowed'
            )}
            onClick={(e) => {
              if (!props.disabled) {
                const input = e.currentTarget.previousElementSibling?.querySelector('input');
                input?.click();
              }
            }}
          >
            {label}
          </label>
        )}
        {error && (
          <p className="ml-7 mt-1 text-sm text-error-600">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
