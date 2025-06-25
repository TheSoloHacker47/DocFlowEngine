// Global error handling utilities

export interface ErrorReport {
  message: string;
  stack?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
  userId?: string;
}

export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 50;
  
  private constructor() {
    this.setupGlobalHandlers();
  }

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  private setupGlobalHandlers(): void {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.handleUnhandledRejection(event);
      });

      // Handle global JavaScript errors
      window.addEventListener('error', (event) => {
        this.handleGlobalError(event);
      });

      // Handle resource loading errors
      window.addEventListener('error', (event) => {
        if (event.target !== window) {
          this.handleResourceError(event);
        }
      }, true);
    }
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const error = event.reason;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    const errorReport: ErrorReport = {
      message: `Unhandled Promise Rejection: ${errorMessage}`,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    if (error instanceof Error && error.stack) {
      errorReport.stack = error.stack;
    }
    
    this.logError(errorReport);

    // Prevent the default browser console error
    event.preventDefault();
  }

  private handleGlobalError(event: ErrorEvent): void {
    this.logError({
      message: event.message,
      stack: event.error?.stack,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }

  private handleResourceError(event: Event): void {
    const target = event.target as HTMLElement;
    const resourceType = target.tagName.toLowerCase();
    
    let resourceSrc = '';
    if ('src' in target) {
      resourceSrc = (target as HTMLImageElement | HTMLScriptElement).src;
    } else if ('href' in target) {
      resourceSrc = (target as HTMLLinkElement).href;
    }
    
    this.logError({
      message: `Failed to load ${resourceType}: ${resourceSrc}`,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }

  private logError(errorReport: ErrorReport): void {
    // Add to queue
    this.errorQueue.push(errorReport);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global Error Caught:', JSON.stringify(errorReport, null, 2));
    }

    // In a real application, you might want to send errors to a logging service
    // this.sendToLoggingService(errorReport);
  }

  public getErrorQueue(): ErrorReport[] {
    return [...this.errorQueue];
  }

  public clearErrorQueue(): void {
    this.errorQueue = [];
  }

  // Method to manually report errors
  public reportError(error: Error | string, context?: Record<string, unknown>): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    const errorReport: ErrorReport = {
      message: `Manual Report: ${errorMessage}`,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context,
    };
    
    if (error instanceof Error && error.stack) {
      errorReport.stack = error.stack;
    }
    
    this.logError(errorReport);
  }
}

// Utility functions for error handling
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('offline') ||
      error.name === 'NetworkError'
    );
  }
  return false;
};

export const isValidationError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes('validation') ||
      error.message.includes('invalid') ||
      error.name === 'ValidationError'
    );
  }
  return false;
};

// Initialize global error handler
let globalErrorHandler: GlobalErrorHandler | null = null;

export const initializeGlobalErrorHandler = (): GlobalErrorHandler => {
  if (!globalErrorHandler) {
    globalErrorHandler = GlobalErrorHandler.getInstance();
  }
  return globalErrorHandler;
};

export const reportGlobalError = (error: Error | string, context?: Record<string, unknown>): void => {
  if (!globalErrorHandler) {
    globalErrorHandler = initializeGlobalErrorHandler();
  }
  globalErrorHandler.reportError(error, context);
}; 