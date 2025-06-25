import { NextRequest, NextResponse } from 'next/server';

interface WebVitalsData {
  name: string;
  value: number;
  id: string;
  url: string;
  timestamp: number;
  userAgent: string;
  connection: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  } | null;
}

export async function POST(request: NextRequest) {
  try {
    const data: WebVitalsData = await request.json();
    
    // Validate required fields
    if (!data.name || typeof data.value !== 'number' || !data.id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, value, id' },
        { status: 400 }
      );
    }

    // Log the Web Vitals data (in production, you'd send this to your analytics service)
    console.log('[Web Vitals]', {
      metric: data.name,
      value: data.value,
      id: data.id,
      url: data.url,
      timestamp: new Date(data.timestamp).toISOString(),
      userAgent: data.userAgent?.substring(0, 100), // Truncate for logging
      connectionType: data.connection?.effectiveType || 'unknown',
    });

    // Here you would typically:
    // 1. Store in database (e.g., PostgreSQL, MongoDB)
    // 2. Send to analytics service (e.g., Google Analytics, Mixpanel)
    // 3. Send to monitoring service (e.g., DataDog, New Relic)
    // 4. Trigger alerts for poor performance metrics
    
    // Example database storage (commented out):
    /*
    await db.webVitals.create({
      data: {
        name: data.name,
        value: data.value,
        metricId: data.id,
        url: data.url,
        timestamp: new Date(data.timestamp),
        userAgent: data.userAgent,
        connectionType: data.connection?.effectiveType,
        downlink: data.connection?.downlink,
        rtt: data.connection?.rtt,
      }
    });
    */

    // Example analytics service integration:
    /*
    await analytics.track('Web Vital Recorded', {
      metric: data.name,
      value: data.value,
      url: data.url,
      timestamp: data.timestamp,
    });
    */

    // Check for performance issues and trigger alerts
    const performanceIssues = checkPerformanceThresholds(data);
    if (performanceIssues.length > 0) {
      console.warn('[Performance Alert]', {
        metric: data.name,
        value: data.value,
        issues: performanceIssues,
        url: data.url,
      });
      
      // In production, you might:
      // - Send to Slack/Discord webhook
      // - Create incident in PagerDuty
      // - Send email alert
      // - Log to monitoring service
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Web Vitals data recorded successfully',
      performanceIssues: performanceIssues.length > 0 ? performanceIssues : undefined
    });

  } catch (error) {
    console.error('[Web Vitals API Error]', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process Web Vitals data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to check performance thresholds
function checkPerformanceThresholds(data: WebVitalsData): string[] {
  const issues: string[] = [];
  
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 }
  };

  const threshold = thresholds[data.name as keyof typeof thresholds];
  if (!threshold) return issues;

  if (data.value > threshold.poor) {
    issues.push(`${data.name} is poor (${data.value}${data.name === 'CLS' ? '' : 'ms'} > ${threshold.poor}${data.name === 'CLS' ? '' : 'ms'})`);
  } else if (data.value > threshold.good) {
    issues.push(`${data.name} needs improvement (${data.value}${data.name === 'CLS' ? '' : 'ms'} > ${threshold.good}${data.name === 'CLS' ? '' : 'ms'})`);
  }

  return issues;
}

// Optional: GET endpoint to retrieve Web Vitals data
export async function GET() {
  // This would typically query your database for recent Web Vitals data
  // For now, return a simple response
  return NextResponse.json({
    message: 'Web Vitals API endpoint',
    endpoints: {
      POST: 'Submit Web Vitals data',
      GET: 'Retrieve Web Vitals data (not implemented)'
    }
  });
} 