'use client';

import { useState, useEffect } from 'react';
import { cacheManager } from '@/lib/cacheManager';

interface OfflineIndicatorProps {
  className?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const [isOffline, setIsOffline] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [cacheStats, setCacheStats] = useState<{
    memoryCache: { size: number };
    browserStorage: { localStorage: number; sessionStorage: number };
  } | null>(null);

  useEffect(() => {
    // Initial network status
    setIsOffline(!navigator.onLine);

    // Network status listeners
    const handleOnline = () => {
      setIsOffline(false);
      console.log('Back online - triggering cache sync');
      
      // Trigger service worker sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          return (registration as any).sync.register('offline-conversion');
        }).catch((error) => {
          console.error('Background sync registration failed:', error);
        });
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      console.log('Gone offline - enabling offline mode');
    };

    // Service worker message listener
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PROCESS_OFFLINE_QUEUE') {
        console.log('Processing offline conversion queue');
        // Handle offline conversion processing
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    // Load cache stats
    loadCacheStats();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  const loadCacheStats = async () => {
    try {
      const stats = await cacheManager.getCacheStats();
      setCacheStats({
        memoryCache: stats.memoryCache,
        browserStorage: stats.browserStorage,
      });
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  };

  const clearCache = async () => {
    try {
      // Clear application cache
      cacheManager.cleanExpired();
      
      // Clear service worker cache
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({ type: 'CLEAR_CACHE' });
        }
      }
      
      // Reload cache stats
      await loadCacheStats();
      
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const triggerCacheCleanup = async () => {
    try {
      // Trigger application cache cleanup
      cacheManager.cleanExpired();
      
      // Trigger service worker cache cleanup
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({ type: 'CLEANUP_CACHE' });
        }
      }
      
      // Reload cache stats
      await loadCacheStats();
      
      console.log('Cache cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup cache:', error);
    }
  };

  if (!isOffline && !showDetails) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      {isOffline && (
        <div className="bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>You're offline. PDF conversions will be processed when you're back online.</span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="ml-2 underline hover:no-underline"
            >
              {showDetails ? 'Hide' : 'Details'}
            </button>
          </div>
        </div>
      )}
      
      {showDetails && (
        <div className="bg-gray-100 border-t border-gray-200 px-4 py-3 text-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Cache & Offline Status</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Network Status</h4>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isOffline 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-1 ${
                    isOffline ? 'bg-red-400' : 'bg-green-400'
                  }`}></div>
                  {isOffline ? 'Offline' : 'Online'}
                </div>
              </div>
              
              {cacheStats && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Cache Statistics</h4>
                  <div className="space-y-1">
                    <div>Memory: {cacheStats.memoryCache.size} items</div>
                    <div>Local Storage: {cacheStats.browserStorage.localStorage} items</div>
                    <div>Session Storage: {cacheStats.browserStorage.sessionStorage} items</div>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Cache Actions</h4>
                <div className="space-y-1">
                  <button
                    onClick={triggerCacheCleanup}
                    className="block w-full text-left px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                  >
                    Clean Expired Cache
                  </button>
                  <button
                    onClick={clearCache}
                    className="block w-full text-left px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                  >
                    Clear All Cache
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Always show cache toggle button for development */}
      {process.env.NODE_ENV === 'development' && !isOffline && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-gray-800 text-white px-3 py-2 rounded-full text-xs hover:bg-gray-700 shadow-lg"
            title="Cache Details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator; 