import { NextRequest, NextResponse } from 'next/server';

interface PerformanceMetrics {
  cls: number | null;
  fid: number | null;
  fcp: number | null;
  lcp: number | null;
  ttfb: number | null;
  timestamp: number;
}

interface PerformanceReportData {
  metrics: PerformanceMetrics;
  navigation: PerformanceNavigationTiming | null;
  resources: PerformanceResourceTiming[];
  memory: any;
  connection: any;
  url: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const data: PerformanceReportData = await request.json();
    
    // Validate required fields
    if (!data.metrics || !data.url || !data.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: metrics, url, timestamp' },
        { status: 400 }
      );
    }

    // Process and analyze the performance data
    const analysis = analyzePerformanceReport(data);
    
    // Log comprehensive performance report
    console.log('[Performance Report]', {
      url: data.url,
      timestamp: new Date(data.timestamp).toISOString(),
      coreWebVitals: {
        lcp: data.metrics.lcp ? `${Math.round(data.metrics.lcp)}ms` : 'Not measured',
        fid: data.metrics.fid ? `${Math.round(data.metrics.fid)}ms` : 'Not measured',
        cls: data.metrics.cls ? data.metrics.cls.toFixed(3) : 'Not measured',
      },
      additionalMetrics: {
        fcp: data.metrics.fcp ? `${Math.round(data.metrics.fcp)}ms` : 'Not measured',
        ttfb: data.metrics.ttfb ? `${Math.round(data.metrics.ttfb)}ms` : 'Not measured',
      },
      navigationTiming: data.navigation ? {
        dnsLookup: Math.round(data.navigation.domainLookupEnd - data.navigation.domainLookupStart),
        tcpConnect: Math.round(data.navigation.connectEnd - data.navigation.connectStart),
        request: Math.round(data.navigation.responseStart - data.navigation.requestStart),
        response: Math.round(data.navigation.responseEnd - data.navigation.responseStart),
        domProcessing: Math.round(data.navigation.domContentLoadedEventEnd - data.navigation.responseEnd),
        loadComplete: Math.round(data.navigation.loadEventEnd - data.navigation.loadEventStart),
      } : null,
      memoryUsage: data.memory ? {
        usedJSHeap: `${(data.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        totalJSHeap: `${(data.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        jsHeapLimit: `${(data.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      } : null,
      connection: data.connection ? {
        effectiveType: data.connection.effectiveType,
        downlink: data.connection.downlink,
        rtt: data.connection.rtt,
        saveData: data.connection.saveData,
      } : null,
      resourceCount: data.resources?.length || 0,
      analysis: analysis,
    });

    // Here you would typically:
    // 1. Store comprehensive report in database
    // 2. Send to APM service (New Relic, DataDog, etc.)
    // 3. Update performance dashboards
    // 4. Trigger alerts for critical issues
    // 5. Generate performance insights and recommendations

    // Example database storage (commented out):
    /*
    await db.performanceReport.create({
      data: {
        url: data.url,
        timestamp: new Date(data.timestamp),
        metrics: data.metrics,
        navigationTiming: data.navigation,
        memoryUsage: data.memory,
        connectionInfo: data.connection,
        resourceCount: data.resources?.length || 0,
        analysis: analysis,
      }
    });
    */

    // Check for critical performance issues
    const criticalIssues = analysis.issues.filter(issue => issue.severity === 'critical');
    if (criticalIssues.length > 0) {
      console.error('[Critical Performance Issues]', {
        url: data.url,
        issues: criticalIssues,
        timestamp: new Date(data.timestamp).toISOString(),
      });

      // Trigger immediate alerts for critical issues
      // await sendCriticalPerformanceAlert(data.url, criticalIssues);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Performance report processed successfully',
      analysis: analysis,
      criticalIssues: criticalIssues.length > 0 ? criticalIssues : undefined
    });

  } catch (error) {
    console.error('[Performance Report API Error]', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process performance report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Analyze performance report and generate insights
function analyzePerformanceReport(data: PerformanceReportData) {
  const analysis = {
    overallScore: 0,
    issues: [] as Array<{ type: string; severity: 'low' | 'medium' | 'high' | 'critical'; message: string; value?: number }>,
    recommendations: [] as string[],
    strengths: [] as string[],
  };

  let scoreComponents = 0;
  let totalScore = 0;

  // Analyze Core Web Vitals
  if (data.metrics.lcp !== null) {
    scoreComponents++;
    if (data.metrics.lcp <= 2500) {
      totalScore += 100;
      analysis.strengths.push('Excellent Largest Contentful Paint');
    } else if (data.metrics.lcp <= 4000) {
      totalScore += 60;
      analysis.issues.push({
        type: 'LCP',
        severity: 'medium',
        message: 'Largest Contentful Paint needs improvement',
        value: data.metrics.lcp
      });
      analysis.recommendations.push('Optimize images and reduce server response times to improve LCP');
    } else {
      totalScore += 20;
      analysis.issues.push({
        type: 'LCP',
        severity: 'high',
        message: 'Poor Largest Contentful Paint performance',
        value: data.metrics.lcp
      });
      analysis.recommendations.push('Critical: Optimize LCP by reducing resource load times and eliminating render-blocking resources');
    }
  }

  if (data.metrics.fid !== null) {
    scoreComponents++;
    if (data.metrics.fid <= 100) {
      totalScore += 100;
      analysis.strengths.push('Excellent First Input Delay');
    } else if (data.metrics.fid <= 300) {
      totalScore += 60;
      analysis.issues.push({
        type: 'FID',
        severity: 'medium',
        message: 'First Input Delay needs improvement',
        value: data.metrics.fid
      });
      analysis.recommendations.push('Reduce JavaScript execution time and break up long tasks to improve FID');
    } else {
      totalScore += 20;
      analysis.issues.push({
        type: 'FID',
        severity: 'high',
        message: 'Poor First Input Delay performance',
        value: data.metrics.fid
      });
      analysis.recommendations.push('Critical: Optimize FID by deferring non-essential JavaScript and using Web Workers');
    }
  }

  if (data.metrics.cls !== null) {
    scoreComponents++;
    if (data.metrics.cls <= 0.1) {
      totalScore += 100;
      analysis.strengths.push('Excellent Cumulative Layout Shift');
    } else if (data.metrics.cls <= 0.25) {
      totalScore += 60;
      analysis.issues.push({
        type: 'CLS',
        severity: 'medium',
        message: 'Cumulative Layout Shift needs improvement',
        value: data.metrics.cls
      });
      analysis.recommendations.push('Set explicit dimensions for images and avoid inserting content above existing content');
    } else {
      totalScore += 20;
      analysis.issues.push({
        type: 'CLS',
        severity: 'high',
        message: 'Poor Cumulative Layout Shift performance',
        value: data.metrics.cls
      });
      analysis.recommendations.push('Critical: Fix layout shifts by reserving space for dynamic content and optimizing font loading');
    }
  }

  // Analyze additional metrics
  if (data.metrics.ttfb !== null) {
    if (data.metrics.ttfb > 1800) {
      analysis.issues.push({
        type: 'TTFB',
        severity: 'high',
        message: 'Slow server response time (TTFB)',
        value: data.metrics.ttfb
      });
      analysis.recommendations.push('Optimize server response time by improving backend performance and using CDN');
    } else if (data.metrics.ttfb > 800) {
      analysis.issues.push({
        type: 'TTFB',
        severity: 'medium',
        message: 'Server response time could be improved',
        value: data.metrics.ttfb
      });
    } else {
      analysis.strengths.push('Fast server response time');
    }
  }

  // Analyze memory usage
  if (data.memory) {
    const memoryUsagePercent = (data.memory.usedJSHeapSize / data.memory.jsHeapSizeLimit) * 100;
    if (memoryUsagePercent > 80) {
      analysis.issues.push({
        type: 'Memory',
        severity: 'critical',
        message: 'High memory usage detected',
        value: memoryUsagePercent
      });
      analysis.recommendations.push('Critical: Investigate memory leaks and optimize JavaScript memory usage');
    } else if (memoryUsagePercent > 60) {
      analysis.issues.push({
        type: 'Memory',
        severity: 'medium',
        message: 'Elevated memory usage',
        value: memoryUsagePercent
      });
      analysis.recommendations.push('Monitor memory usage and consider optimizing large objects');
    }
  }

  // Analyze resource count
  if (data.resources && data.resources.length > 100) {
    analysis.issues.push({
      type: 'Resources',
      severity: 'medium',
      message: 'High number of network requests',
      value: data.resources.length
    });
    analysis.recommendations.push('Reduce the number of network requests by bundling resources and using HTTP/2');
  }

  // Calculate overall score
  analysis.overallScore = scoreComponents > 0 ? Math.round(totalScore / scoreComponents) : 0;

  return analysis;
}

// Optional: GET endpoint to retrieve performance reports
export async function GET() {
  return NextResponse.json({
    message: 'Performance Report API endpoint',
    endpoints: {
      POST: 'Submit comprehensive performance report',
      GET: 'Retrieve performance reports (not implemented)'
    }
  });
} 