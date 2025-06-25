'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { trackPerformanceMetric } from '@/lib/analytics';
// import { reportMessage } from '@/lib/sentry';

interface PerformanceMetrics {
  cls: number | null;
  inp: number | null; // INP replaces FID in web-vitals v5
  fcp: number | null;
  lcp: number | null;
  ttfb: number | null;
  timestamp: number;
}

interface PerformanceReport {
  metrics: PerformanceMetrics;
  navigation: PerformanceNavigationTiming | null;
  resources: PerformanceResourceTiming[];
  memory: any;
  connection: any;
}

const PerformanceMonitor: React.FC<{ 
  enableDevDashboard?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}> = ({ enableDevDashboard = false, onMetricsUpdate }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cls: null,
    inp: null,
    fcp: null,
    lcp: null,
    ttfb: null,
    timestamp: Date.now()
  });

  const metricsRef = useRef(metrics);
  metricsRef.current = metrics;

  const onMetricsUpdateRef = useRef(onMetricsUpdate);
  onMetricsUpdateRef.current = onMetricsUpdate;

  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Web Vitals reporting function
  const reportWebVital = useCallback((metric: Metric) => {
    const { name, value, id } = metric;
    
    setMetrics(prevMetrics => {
      const newMetrics = {
        ...prevMetrics,
        [name.toLowerCase()]: value,
        timestamp: Date.now()
      };
      if (onMetricsUpdateRef.current) {
        onMetricsUpdateRef.current(newMetrics);
      }
      return newMetrics;
    });

    // Send to analytics (Google Analytics 4 example)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, {
        event_category: 'Web Vitals',
        event_label: id,
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        non_interaction: true,
      });
    }

    // Send to custom analytics endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          value,
          id,
          url: window.location.href,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          connection: (navigator as any).connection || null,
        }),
      }).catch(console.error);
    }

    console.log(`[Performance] ${name}: ${value}${name === 'CLS' ? '' : 'ms'} (ID: ${id})`);
  }, []);

  // Collect comprehensive performance data
  const collectPerformanceReport = useCallback(() => {
    if (typeof window === 'undefined') return;

    const currentMetrics = metricsRef.current;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const memory = (performance as any).memory || null;
    const connection = (navigator as any).connection || null;

    const report: PerformanceReport = {
      metrics: currentMetrics,
      navigation,
      resources: resources.slice(-20), // Last 20 resources to avoid overwhelming data
      memory,
      connection
    };

    setPerformanceReport(report);
    
    // Send comprehensive report to monitoring service
    fetch('/api/analytics/performance-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...report,
        url: window.location.href,
        timestamp: Date.now(),
      }),
    }).catch(console.error);

    return report;
  }, []);

  // Initialize Web Vitals monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Collect Web Vitals
    onCLS(reportWebVital);
    onINP(reportWebVital); // INP replaces FID in web-vitals v5
    onFCP(reportWebVital);
    onLCP(reportWebVital);
    onTTFB(reportWebVital);

    // Collect performance report after page load
    const timer = setTimeout(() => {
      collectPerformanceReport();
    }, 3000);

    return () => clearTimeout(timer);
  }, [reportWebVital, collectPerformanceReport]);

  // Performance Observer for additional metrics
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log(`[Performance] LCP candidate: ${entry.startTime}ms`);
        }
        
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          console.log(`[Performance] Layout shift: ${(entry as any).value}`);
        }

        if (entry.entryType === 'long-animation-frame') {
          console.warn(`[Performance] Long animation frame: ${entry.duration}ms`);
        }

        if (entry.entryType === 'longtask') {
          console.warn(`[Performance] Long task: ${entry.duration}ms`);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });
      
      // Observe long tasks if supported
      if ('longtask' in PerformanceObserver.supportedEntryTypes) {
        observer.observe({ entryTypes: ['longtask'] });
      }

      // Observe long animation frames if supported (Chrome 123+)
      if ('long-animation-frame' in PerformanceObserver.supportedEntryTypes) {
        observer.observe({ entryTypes: ['long-animation-frame'] });
      }
    } catch (e) {
      console.warn('[Performance] Some performance observations not supported:', e);
    }

    return () => observer.disconnect();
  }, []);

  // Development dashboard toggle
  const toggleDashboard = () => {
    setIsVisible(!isVisible);
  };

  // Format metric values for display
  const formatMetric = (name: string, value: number | null) => {
    if (value === null) return 'Measuring...';
    
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    
    return `${Math.round(value)}ms`;
  };

  // Get metric status (good, needs improvement, poor)
  const getMetricStatus = (name: string, value: number | null) => {
    if (value === null) return 'measuring';
    
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      INP: { good: 200, poor: 500 }, // INP thresholds in milliseconds
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  if (!enableDevDashboard) {
    return null; // Silent monitoring mode
  }

  return (
    <>
      {/* Development Performance Dashboard Toggle */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={toggleDashboard}
          className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          title="Toggle Performance Dashboard"
        >
          📊 Perf
        </button>
      )}

      {/* Performance Dashboard */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
                <button
                  onClick={toggleDashboard}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>

              {/* Core Web Vitals */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'LCP', label: 'Largest Contentful Paint', value: metrics.lcp },
                    { name: 'INP', label: 'Interaction to Next Paint', value: metrics.inp },
                    { name: 'CLS', label: 'Cumulative Layout Shift', value: metrics.cls }
                  ].map(({ name, label, value }) => {
                    const status = getMetricStatus(name, value);
                    const statusColors = {
                      good: 'bg-green-100 text-green-800 border-green-200',
                      'needs-improvement': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                      poor: 'bg-red-100 text-red-800 border-red-200',
                      measuring: 'bg-gray-100 text-gray-800 border-gray-200',
                      unknown: 'bg-gray-100 text-gray-800 border-gray-200'
                    };

                    return (
                      <div key={name} className={`p-4 rounded-lg border-2 ${statusColors[status]}`}>
                        <div className="text-sm font-medium">{name}</div>
                        <div className="text-2xl font-bold">{formatMetric(name, value)}</div>
                        <div className="text-xs">{label}</div>
                        <div className="text-xs mt-1 capitalize">{status.replace('-', ' ')}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Additional Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'FCP', label: 'First Contentful Paint', value: metrics.fcp },
                    { name: 'TTFB', label: 'Time to First Byte', value: metrics.ttfb }
                  ].map(({ name, label, value }) => (
                    <div key={name} className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium">{name}</div>
                      <div className="text-xl font-bold">{formatMetric(name, value)}</div>
                      <div className="text-xs text-gray-600">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Timing */}
              {performanceReport?.navigation && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Navigation Timing</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">DNS Lookup</div>
                        <div>{Math.round(performanceReport.navigation.domainLookupEnd - performanceReport.navigation.domainLookupStart)}ms</div>
                      </div>
                      <div>
                        <div className="font-medium">TCP Connect</div>
                        <div>{Math.round(performanceReport.navigation.connectEnd - performanceReport.navigation.connectStart)}ms</div>
                      </div>
                      <div>
                        <div className="font-medium">Request</div>
                        <div>{Math.round(performanceReport.navigation.responseStart - performanceReport.navigation.requestStart)}ms</div>
                      </div>
                      <div>
                        <div className="font-medium">Response</div>
                        <div>{Math.round(performanceReport.navigation.responseEnd - performanceReport.navigation.responseStart)}ms</div>
                      </div>
                      <div>
                        <div className="font-medium">DOM Processing</div>
                        <div>{Math.round(performanceReport.navigation.domContentLoadedEventEnd - performanceReport.navigation.responseEnd)}ms</div>
                      </div>
                      <div>
                        <div className="font-medium">Load Complete</div>
                        <div>{Math.round(performanceReport.navigation.loadEventEnd - performanceReport.navigation.loadEventStart)}ms</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Memory Usage */}
              {performanceReport?.memory && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Memory Usage</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Used JS Heap</div>
                        <div>{(performanceReport.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                      <div>
                        <div className="font-medium">Total JS Heap</div>
                        <div>{(performanceReport.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                      <div>
                        <div className="font-medium">JS Heap Limit</div>
                        <div>{(performanceReport.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Connection Info */}
              {performanceReport?.connection && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Connection Info</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Effective Type</div>
                        <div>{performanceReport.connection.effectiveType || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="font-medium">Downlink</div>
                        <div>{performanceReport.connection.downlink || 'Unknown'} Mbps</div>
                      </div>
                      <div>
                        <div className="font-medium">RTT</div>
                        <div>{performanceReport.connection.rtt || 'Unknown'}ms</div>
                      </div>
                      <div>
                        <div className="font-medium">Save Data</div>
                        <div>{performanceReport.connection.saveData ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={collectPerformanceReport}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh Data
                </button>
                <button
                  onClick={() => {
                    if (performanceReport) {
                      const dataStr = JSON.stringify(performanceReport, null, 2);
                      const dataBlob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `performance-report-${Date.now()}.json`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceMonitor;

// Hook for tracking conversion performance
export const useConversionMetrics = () => {
  const [conversionMetrics, setConversionMetrics] = useState({
    totalConversions: 0,
    averageProcessingTime: 0,
    successRate: 100,
    errorRate: 0,
  });

  const trackConversion = (processingTime: number, success: boolean) => {
    setConversionMetrics(prev => {
      const newTotal = prev.totalConversions + 1;
      const newErrors = success ? prev.errorRate * prev.totalConversions : (prev.errorRate * prev.totalConversions) + 1;
      const newAverage = ((prev.averageProcessingTime * prev.totalConversions) + processingTime) / newTotal;
      
      return {
        totalConversions: newTotal,
        averageProcessingTime: newAverage,
        successRate: ((newTotal - newErrors) / newTotal) * 100,
        errorRate: (newErrors / newTotal) * 100,
      };
    });

    // Track in analytics
    trackPerformanceMetric('conversion_processing_time', processingTime, 'ms');
    trackPerformanceMetric('conversion_success_rate', success ? 1 : 0, 'boolean');
  };

  return { conversionMetrics, trackConversion };
}; 