// Google Analytics 4 (GA4) implementation for Next.js App Router
// Using the modern gtag approach recommended by Google

import { reportError } from './sentry';

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_TRACKING_ID) {
    console.warn('GA_TRACKING_ID is not set. Analytics will not be initialized.');
    return;
  }

  // Load gtag script
  if (typeof window !== 'undefined') {
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (url: string) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return;

  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// Track custom events
interface EventParams {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export const trackEvent = ({ action, category, label, value, custom_parameters }: EventParams) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...custom_parameters,
  });
};

// Specific event tracking functions for DocFlowEngine
export const trackFileUpload = (fileSize: number, fileType: string) => {
  trackEvent({
    action: 'file_upload',
    category: 'conversion',
    label: fileType,
    value: Math.round(fileSize / 1024), // File size in KB
    custom_parameters: {
      file_size_bytes: fileSize,
      file_type: fileType,
    },
  });
};

export const trackConversionStart = (fileSize: number, fileName: string) => {
  trackEvent({
    action: 'conversion_start',
    category: 'conversion',
    label: 'pdf_to_word',
    value: Math.round(fileSize / 1024), // File size in KB
    custom_parameters: {
      file_size_bytes: fileSize,
      file_name_length: fileName.length,
    },
  });
};

export const trackConversionComplete = (processingTime: number, fileSize: number, success: boolean) => {
  trackEvent({
    action: success ? 'conversion_success' : 'conversion_failure',
    category: 'conversion',
    label: 'pdf_to_word',
    value: Math.round(processingTime / 1000), // Processing time in seconds
    custom_parameters: {
      processing_time_ms: processingTime,
      file_size_bytes: fileSize,
      success: success,
    },
  });
};

export const trackDownload = (fileName: string, fileSize: number) => {
  trackEvent({
    action: 'file_download',
    category: 'conversion',
    label: 'docx',
    value: Math.round(fileSize / 1024), // File size in KB
    custom_parameters: {
      file_size_bytes: fileSize,
      file_name_length: fileName.length,
    },
  });
};

export const trackCTAClick = (ctaLocation: string, ctaText: string) => {
  trackEvent({
    action: 'cta_click',
    category: 'engagement',
    label: ctaLocation,
    custom_parameters: {
      cta_text: ctaText,
      cta_location: ctaLocation,
    },
  });
};

export const trackFAQInteraction = (question: string, action: 'open' | 'close') => {
  trackEvent({
    action: `faq_${action}`,
    category: 'engagement',
    label: question.substring(0, 50), // Truncate for analytics
    custom_parameters: {
      faq_action: action,
      question_length: question.length,
    },
  });
};

export const trackError = (errorType: string, errorMessage: string, context: string) => {
  // Track in Google Analytics
  trackEvent({
    action: 'error_occurred',
    category: 'error',
    label: errorType,
    custom_parameters: {
      error_message: errorMessage.substring(0, 100), // Truncate for privacy
      error_context: context,
      error_type: errorType,
    },
  });
  
  // Also report to Sentry for detailed error tracking
  const error = new Error(errorMessage);
  error.name = errorType;
  reportError(error, {
    error_type: errorType,
    error_context: context,
    source: 'analytics_tracking',
  });
};

// Performance tracking
export const trackPerformanceMetric = (metricName: string, value: number, unit: string) => {
  trackEvent({
    action: 'performance_metric',
    category: 'performance',
    label: metricName,
    value: Math.round(value),
    custom_parameters: {
      metric_name: metricName,
      metric_value: value,
      metric_unit: unit,
    },
  });
};

// User engagement tracking
export const trackUserEngagement = (engagementType: string, duration?: number) => {
  const eventData: EventParams = {
    action: 'user_engagement',
    category: 'engagement',
    label: engagementType,
    custom_parameters: {
      engagement_type: engagementType,
      duration_ms: duration,
    },
  };

  // Only add value if duration is provided
  if (duration !== undefined) {
    eventData.value = Math.round(duration / 1000);
  }

  trackEvent(eventData);
};

// Check if analytics is enabled
export const isAnalyticsEnabled = (): boolean => {
  return Boolean(GA_TRACKING_ID && typeof window !== 'undefined' && window.gtag);
};

// Consent management (for GDPR compliance)
export const setAnalyticsConsent = (consent: boolean) => {
  if (typeof window === 'undefined') return;

  window.gtag('consent', 'update', {
    analytics_storage: consent ? 'granted' : 'denied',
  });
};

// Initialize consent (should be called before GA initialization)
export const initAnalyticsConsent = (hasConsent: boolean = true) => {
  if (typeof window === 'undefined') return;

  window.gtag('consent', 'default', {
    analytics_storage: hasConsent ? 'granted' : 'denied',
  });
}; 