import { useState, useCallback } from 'react';
import { ConversionResult } from '@/lib';
import { useErrorState, ErrorManager } from './useErrorState';

export type ConversionStatus = 'idle' | 'processing' | 'success' | 'error';

export interface ConversionState {
  status: ConversionStatus;
  progress: number;
  result: ConversionResult | null;
  processingTime: number;
  startTime: number | null;
}

export interface ConversionManager {
  state: ConversionState;
  errorManager: ErrorManager;
  startConversion: () => void;
  updateProgress: (progress: number) => void;
  setSuccess: (result: ConversionResult) => void;
  setError: (message: string, type?: 'conversion' | 'download' | 'validation' | 'network') => void;
  reset: () => void;
  isProcessing: boolean;
  canRetry: boolean;
}

const initialState: ConversionState = {
  status: 'idle',
  progress: 0,
  result: null,
  processingTime: 0,
  startTime: null,
};

export function useConversionState(): ConversionManager {
  const [state, setState] = useState<ConversionState>(initialState);
  const errorManager = useErrorState();

  const startConversion = useCallback(() => {
    console.log('🚀 Starting conversion...');
    
    // Clear any previous errors
    errorManager.clearAllErrors();
    
    setState({
      status: 'processing',
      progress: 0,
      result: null,
      processingTime: 0,
      startTime: Date.now(),
    });
  }, [errorManager]);

  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(Math.max(progress, 0), 100), // Clamp between 0-100
    }));
  }, []);

  const setSuccess = useCallback((result: ConversionResult) => {
    console.log('✅ Conversion successful');
    
    setState(prev => {
      const endTime = Date.now();
      const processingTime = prev.startTime ? endTime - prev.startTime : 0;
      
      return {
        status: 'success',
        progress: 100,
        result,
        processingTime,
        startTime: prev.startTime,
      };
    });
  }, []);

  const setError = useCallback((
    message: string, 
    type: 'conversion' | 'download' | 'validation' | 'network' = 'conversion'
  ) => {
    console.error('❌ Conversion error:', message);
    
    // Add error to error manager
    const errorId = errorManager.addError(message, type, {
      conversionStatus: state.status,
      progress: state.progress,
      timestamp: new Date().toISOString(),
    });

    setState(prev => {
      const endTime = Date.now();
      const processingTime = prev.startTime ? endTime - prev.startTime : 0;
      
      return {
        status: 'error',
        progress: 0,
        result: null,
        processingTime,
        startTime: prev.startTime,
      };
    });

    return errorId;
  }, [errorManager, state.status, state.progress]);

  const reset = useCallback(() => {
    console.log('🔄 Resetting conversion state');
    setState(initialState);
    errorManager.clearAllErrors();
  }, [errorManager]);

  const isProcessing = state.status === 'processing';
  const canRetry = state.status === 'error' || (state.status === 'success' && state.result !== null);

  return {
    state,
    errorManager,
    startConversion,
    updateProgress,
    setSuccess,
    setError,
    reset,
    isProcessing,
    canRetry,
  };
} 