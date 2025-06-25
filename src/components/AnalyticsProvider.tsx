'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView, initAnalyticsConsent, GA_TRACKING_ID } from '@/lib/analytics';
import { initSentry } from '@/lib/sentry';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initializeAnalytics = useCallback(() => {
    // Initialize Sentry error reporting
    initSentry();
    
    // Initialize consent management
    initAnalyticsConsent(true);

    // Initial page view
    if (GA_TRACKING_ID) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Wait for the gtag script to be loaded
    const checkGtag = () => {
      if (typeof (window as any).gtag === 'function') {
        initializeAnalytics();
      } else {
        setTimeout(checkGtag, 100); // Check again in 100ms
      }
    };

    checkGtag();
  }, [initializeAnalytics]);

  useEffect(() => {
    if (!GA_TRACKING_ID || typeof (window as any).gtag !== 'function') return;

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    trackPageView(url);
  }, [pathname, searchParams]);

  return <>{children}</>;
} 