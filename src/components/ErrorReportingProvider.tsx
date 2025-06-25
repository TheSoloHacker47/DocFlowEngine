'use client';

import { useEffect } from 'react';
import { reportError, reportMessage, addErrorContext } from '@/lib/sentry';

export default function ErrorReportingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      reportError(error, {
        type: 'unhandled_promise_rejection',
        source: 'window_event',
        url: window.location.href,
      });
    };

    // Handle unhandled JavaScript errors
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      
      const error = event.error instanceof Error 
        ? event.error 
        : new Error(event.message);
      
      reportError(error, {
        type: 'unhandled_error',
        source: 'window_event',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href,
      });
    };

    // Add global context
    addErrorContext('user_agent', navigator.userAgent);
    addErrorContext('url', window.location.href);
    addErrorContext('timestamp', new Date().toISOString());

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup function
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return <>{children}</>;
} 