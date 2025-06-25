'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ResourcePreloaderProps {
  // Optional props for customization
  enableIntersectionPreloading?: boolean;
  enableIdlePreloading?: boolean;
}

const ResourcePreloader: React.FC<ResourcePreloaderProps> = ({
  enableIntersectionPreloading = true,
  enableIdlePreloading = true,
}) => {
  const router = useRouter();

  // Preload critical resources when the browser is idle
  const preloadOnIdle = useCallback(() => {
    if (!enableIdlePreloading) return;

    const preloadResources = () => {
      // Preload heavy conversion libraries when idle
      const preloadLinks = [
        // Prefetch route-based resources
        { href: '/about', as: 'document' },
        { href: '/contact', as: 'document' },
        { href: '/privacy-policy', as: 'document' },
        { href: '/terms-of-service', as: 'document' },
      ];

      preloadLinks.forEach(({ href, as }) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        link.as = as;
        document.head.appendChild(link);
      });

      // Preload conversion engine modules when idle
      import('@/lib/LazyConversionEngine').catch(() => {
        // Silently fail if module not available
      });
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preloadResources, { timeout: 5000 });
    } else {
      setTimeout(preloadResources, 2000);
    }
  }, [enableIdlePreloading]);

  // Preload resources based on user interactions
  const setupInteractionPreloading = useCallback(() => {
    if (!enableIntersectionPreloading) return;

    // Preload conversion resources when user hovers over file upload area
    const handleFileUploadHover = () => {
      // Preload PDF.js and DOCX libraries
      const preloadScript = document.createElement('link');
      preloadScript.rel = 'modulepreload';
      preloadScript.href = '/js/pdf.worker.min.mjs';
      document.head.appendChild(preloadScript);

      // Preload conversion engine
      import('@/lib/LazyConversionEngine').catch(() => {
        // Silently fail if module not available
      });
    };

    // Add hover listeners to file upload elements
    const fileUploadElements = document.querySelectorAll('[data-file-upload]');
    fileUploadElements.forEach(element => {
      element.addEventListener('mouseenter', handleFileUploadHover, { once: true });
    });

    // Cleanup function
    return () => {
      fileUploadElements.forEach(element => {
        element.removeEventListener('mouseenter', handleFileUploadHover);
      });
    };
  }, [enableIntersectionPreloading]);

  // Setup intersection observer for component-based preloading
  const setupIntersectionPreloading = useCallback(() => {
    if (!enableIntersectionPreloading || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const preloadType = target.dataset.preload;

            switch (preloadType) {
              case 'ads':
                // Preload ad components when they come into view
                import('@/components/LazyAds').catch(() => {});
                break;
              case 'analytics':
                // Preload analytics components
                import('@/components/AnalyticsProvider').catch(() => {});
                break;
              default:
                break;
            }

            observer.unobserve(target);
          }
        });
      },
      {
        rootMargin: '200px', // Start preloading 200px before element comes into view
        threshold: 0.1,
      }
    );

    // Observe elements with preload data attributes
    const preloadElements = document.querySelectorAll('[data-preload]');
    preloadElements.forEach(element => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [enableIntersectionPreloading]);

  // Network-aware preloading
  const setupNetworkAwarePreloading = useCallback(() => {
    // Check if Network Information API is available
    if (!('connection' in navigator)) return;

    const connection = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
    
    // Only preload heavy resources on fast connections
    if (connection && (connection.effectiveType === '4g' || connection.effectiveType === '3g')) {
      // Safe to preload heavy resources
      const heavyResources = [
        '/js/pdf.worker.min.mjs',
      ];

      heavyResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = 'script';
        document.head.appendChild(link);
      });
    }
  }, []);

  // Setup all preloading strategies
  useEffect(() => {
    // Initial setup
    const cleanupFunctions: (() => void)[] = [];

    // Setup different preloading strategies
    preloadOnIdle();
    
    const interactionCleanup = setupInteractionPreloading();
    if (interactionCleanup) cleanupFunctions.push(interactionCleanup);

    const intersectionCleanup = setupIntersectionPreloading();
    if (intersectionCleanup) cleanupFunctions.push(intersectionCleanup);

    setupNetworkAwarePreloading();

    // Cleanup on unmount
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [preloadOnIdle, setupInteractionPreloading, setupIntersectionPreloading, setupNetworkAwarePreloading]);

  // Prefetch routes based on current page
  useEffect(() => {
    // Prefetch likely next pages based on current route
    const currentPath = window.location.pathname;
    
    if (currentPath === '/') {
      // On home page, prefetch about and contact pages
      router.prefetch('/about');
      router.prefetch('/contact');
    }
  }, [router]);

  return null; // This component doesn't render anything
};

export default ResourcePreloader; 