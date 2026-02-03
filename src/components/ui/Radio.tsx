import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-center">
        <input
          ref={ref}
          id={radioId}
          type="radio"
          className={cn(
            'w-4 h-4 text-primary-600 bg-white border-gray-300',
            'focus:ring-2 focus:ring-primary-500 focus:ring-offset-0',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={radioId}
            className="ml-2 text-sm font-medium text-gray-900 cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

// RadioGroup компонент для группировки radio кнопок
interface RadioGroupProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

export function RadioGroup({ children, className, label }: RadioGroupProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}
