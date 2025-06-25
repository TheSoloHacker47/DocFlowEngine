import React from 'react';
import { ErrorState } from '@/hooks/useErrorState';
import Error from './Error';

interface ErrorDisplayProps {
  errors: ErrorState[];
  onRetry?: () => void;
  onResolve?: (errorId: string) => void;
  onClear?: (errorId: string) => void;
  showAll?: boolean;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  errors,
  onRetry,
  onResolve,
  onClear,
  showAll = false,
  className = '',
}) => {
  const unresolvedErrors = errors.filter(error => !error.resolved);
  const displayErrors = showAll ? errors : unresolvedErrors;

  if (displayErrors.length === 0) {
    return null;
  }

  const getErrorVariant = (type: ErrorState['type']) => {
    switch (type) {
      case 'validation':
        return 'warning' as const;
      case 'network':
        return 'error' as const;
      case 'conversion':
        return 'error' as const;
      case 'download':
        return 'error' as const;
      default:
        return 'error' as const;
    }
  };

  const getErrorTitle = (type: ErrorState['type']) => {
    switch (type) {
      case 'validation':
        return 'Validation Error';
      case 'network':
        return 'Network Error';
      case 'conversion':
        return 'Conversion Error';
      case 'download':
        return 'Download Error';
      default:
        return 'Error';
    }
  };

  // Show only the most recent error if not showing all
  const primaryError = displayErrors[0]!;

  return (
    <div className={`error-display ${className}`}>
      {/* Primary Error Display */}
      <Error
        title={getErrorTitle(primaryError.type)}
        message={primaryError.message}
        variant={getErrorVariant(primaryError.type)}
        {...(onRetry && { onRetry })}
        onDismiss={() => {
          if (onResolve) {
            onResolve(primaryError.id);
          } else if (onClear) {
            onClear(primaryError.id);
          }
        }}
        className="mb-4"
      />

      {/* Additional Errors (if showing all and there are more) */}
      {showAll && displayErrors.length > 1 && (
        <div className="mt-4">
          <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              View {displayErrors.length - 1} additional error{displayErrors.length > 2 ? 's' : ''}
            </summary>
            <div className="mt-3 space-y-3">
              {displayErrors.slice(1).map((error) => (
                <div
                  key={error.id}
                  className="bg-white border border-gray-200 rounded-md p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {getErrorTitle(error.type)}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{error.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {error.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {onResolve && !error.resolved && (
                        <button
                          onClick={() => onResolve(error.id)}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                        >
                          Resolve
                        </button>
                      )}
                      {onClear && (
                        <button
                          onClick={() => onClear(error.id)}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  {error.context && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">
                        Debug Info
                      </summary>
                      <pre className="text-xs text-gray-400 mt-1 overflow-auto">
                        {JSON.stringify(error.context, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay; 