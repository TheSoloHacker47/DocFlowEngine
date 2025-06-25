import { useState, useCallback, useRef } from 'react';

export interface ErrorState {
  id: string;
  message: string;
  timestamp: Date;
  type: 'conversion' | 'download' | 'validation' | 'network' | 'unknown';
  context?: Record<string, unknown>;
  resolved: boolean;
}

export interface ErrorManager {
  errors: ErrorState[];
  currentError: ErrorState | null;
  hasErrors: boolean;
  addError: (message: string, type?: ErrorState['type'], context?: Record<string, unknown>) => string;
  resolveError: (errorId: string) => void;
  clearError: (errorId: string) => void;
  clearAllErrors: () => void;
  getErrorsByType: (type: ErrorState['type']) => ErrorState[];
  getUnresolvedErrors: () => ErrorState[];
}

export function useErrorState(): ErrorManager {
  const [errors, setErrors] = useState<ErrorState[]>([]);
  const errorIdCounter = useRef(0);

  const addError = useCallback((
    message: string, 
    type: ErrorState['type'] = 'unknown',
    context?: Record<string, unknown>
  ): string => {
    const errorId = `error_${Date.now()}_${++errorIdCounter.current}`;
    
    const newError: ErrorState = {
      id: errorId,
      message,
      type,
      timestamp: new Date(),
      resolved: false,
      ...(context && { context }),
    };

    setErrors(prev => {
      // Limit to last 10 errors to prevent memory issues
      const updatedErrors = [newError, ...prev].slice(0, 10);
      
      // Log error for debugging
      console.error(`🚨 Error [${type}]:`, {
        id: errorId,
        message,
        context,
        timestamp: newError.timestamp
      });
      
      return updatedErrors;
    });

    return errorId;
  }, []);

  const resolveError = useCallback((errorId: string) => {
    setErrors(prev => prev.map(error => 
      error.id === errorId 
        ? { ...error, resolved: true }
        : error
    ));
    
    console.log(`✅ Error resolved: ${errorId}`);
  }, []);

  const clearError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
    console.log(`🗑️ Error cleared: ${errorId}`);
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
    console.log('🧹 All errors cleared');
  }, []);

  const getErrorsByType = useCallback((type: ErrorState['type']) => {
    return errors.filter(error => error.type === type);
  }, [errors]);

  const getUnresolvedErrors = useCallback(() => {
    return errors.filter(error => !error.resolved);
  }, [errors]);

  const currentError = errors.length > 0 ? errors[0]! : null;
  const hasErrors = getUnresolvedErrors().length > 0;

  return {
    errors,
    currentError,
    hasErrors,
    addError,
    resolveError,
    clearError,
    clearAllErrors,
    getErrorsByType,
    getUnresolvedErrors,
  };
} 