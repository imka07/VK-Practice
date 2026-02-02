import React from 'react';
import { cn } from '@/lib/utils/cn';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantConfig = {
  info: {
    container: 'bg-primary-50 border-primary-200',
    icon: Info,
    iconColor: 'text-primary-600',
    title: 'text-primary-900',
    text: 'text-primary-700',
  },
  success: {
    container: 'bg-success-50 border-success-200',
    icon: CheckCircle,
    iconColor: 'text-success-600',
    title: 'text-success-900',
    text: 'text-success-700',
  },
  warning: {
    container: 'bg-warning-50 border-warning-200',
    icon: AlertCircle,
    iconColor: 'text-warning-600',
    title: 'text-warning-900',
    text: 'text-warning-700',
  },
  error: {
    container: 'bg-error-50 border-error-200',
    icon: XCircle,
    iconColor: 'text-error-600',
    title: 'text-error-900',
    text: 'text-error-700',
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative p-4 border rounded-lg',
        config.container,
        className
      )}
      role="alert"
    >
      <div className="flex items-start">
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconColor)} />
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={cn('text-sm font-medium mb-1', config.title)}>
              {title}
            </h3>
          )}
          <div className={cn('text-sm', config.text)}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              'ml-3 inline-flex flex-shrink-0',
              'hover:opacity-70 transition-opacity',
              config.iconColor
            )}
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
