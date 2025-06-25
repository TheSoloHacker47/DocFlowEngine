import * as Sentry from '@sentry/nextjs';
import React from 'react';

// Sentry configuration
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || '';
const SENTRY_ENVIRONMENT = process.env.NODE_ENV || 'development';

// Initialize Sentry
export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.warn('SENTRY_DSN is not set. Error reporting will not be initialized.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    
    // Performance monitoring
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
    
    // Session replay (optional, can be resource-intensive)
    replaysSessionSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.01 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Filter out known non-critical errors
    beforeSend(event, hint) {
      // Filter out PDF.js worker errors that are often false positives
      if (hint.originalException) {
        const error = hint.originalException as Error;
        if (error.message?.includes('pdf.worker') || 
            error.message?.includes('SharedArrayBuffer') ||
            error.message?.includes('ResizeObserver loop limit exceeded')) {
          return null; // Don't send to Sentry
        }
      }
      
      // Filter out network errors that are user-related
      if (event.exception?.values?.[0]?.type === 'ChunkLoadError' ||
          event.exception?.values?.[0]?.type === 'NetworkError') {
        return null;
      }
      
      return event;
    },
    
    // Add user context and additional metadata
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null;
      }
      return breadcrumb;
    },
    
    // Configure integrations (using modern API)
    integrations: [
      // Modern Sentry integrations are automatically included
    ],
  });
};

// Manual error reporting functions
export const reportError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setExtra(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
};

export const reportMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setExtra(key, context[key]);
      });
    }
    Sentry.captureMessage(message, level);
  });
};

// Set user context for better error tracking
export const setUserContext = (user: { id?: string; email?: string; [key: string]: any }) => {
  Sentry.setUser(user);
};

// Add tags for categorizing errors
export const addErrorTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

// Add extra context to all future errors
export const addErrorContext = (key: string, value: any) => {
  Sentry.setExtra(key, value);
};

// Performance monitoring (modern API)
export const startTransaction = (name: string, operation?: string) => {
  const spanOptions: any = { name };
  if (operation) {
    spanOptions.op = operation;
  }
  return Sentry.startSpan(spanOptions, () => {
    // Transaction logic goes here
  });
};

// Check if Sentry is initialized
export const isSentryEnabled = (): boolean => {
  return Boolean(SENTRY_DSN && Sentry.getClient());
};

// Manual error capture with Sentry
export const captureError = (error: Error, context?: Record<string, any>) => {
  if (isSentryEnabled()) {
    reportError(error, context);
  } else {
    console.error('Error (Sentry not available):', error, context);
  }
}; 