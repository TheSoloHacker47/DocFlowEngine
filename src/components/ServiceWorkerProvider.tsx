'use client';

import { useEffect } from 'react';

interface ServiceWorkerProviderProps {
  children: React.ReactNode;
}

export default function ServiceWorkerProvider({ children }: ServiceWorkerProviderProps) {
  useEffect(() => {
    // Only register service worker in production and if supported
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });

          console.log('[ServiceWorker] Registration successful with scope:', registration.scope);

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is available, notify user
                  console.log('[ServiceWorker] New version available');
                  // You could show a toast notification here
                }
              });
            }
          });

          // Listen for controlling service worker changes
          let refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
              refreshing = true;
              window.location.reload();
            }
          });

        } catch (error) {
          console.error('[ServiceWorker] Registration failed:', error);
        }
      };

      // Register on load
      window.addEventListener('load', registerServiceWorker);

      return () => {
        window.removeEventListener('load', registerServiceWorker);
      };
    }
    
    // Return undefined for the else case
    return undefined;
  }, []);

  return <>{children}</>;
} 