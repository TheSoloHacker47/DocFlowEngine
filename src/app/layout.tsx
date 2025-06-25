import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/ToastContainer';
import GlobalErrorHandlerProvider from '@/components/GlobalErrorHandlerProvider';
import AnalyticsProvider from '@/components/AnalyticsProvider';
import ErrorReportingProvider from '@/components/ErrorReportingProvider';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import ServiceWorkerProvider from '@/components/ServiceWorkerProvider';
import ResourcePreloader from '@/components/ResourcePreloader';
import OfflineIndicator from '@/components/OfflineIndicator';
import { ADSENSE_CONFIG, ADSENSE_SCRIPT_URL, isAdSenseEnabled } from '@/config/adsense';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'DocFlowEngine - Convert PDF to Word Online | Free PDF to DOCX Converter',
  description: 'Professional PDF to Word converter with complete privacy. Convert PDFs to editable DOCX files with images, tables, and formatting preserved. 100% client-side processing, no registration required.',
  keywords: 'PDF to Word, PDF to DOCX, convert PDF, PDF converter, document converter, free PDF converter, online PDF converter, PDF to Word online, DOCX converter',
  authors: [{ name: 'DocFlowEngine' }],
  creator: 'DocFlowEngine',
  publisher: 'DocFlowEngine',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://docflowengine.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'DocFlowEngine - Convert PDF to Word Online',
    description: 'Professional PDF to Word converter with complete privacy. Convert PDFs to editable DOCX files instantly.',
    url: 'https://docflowengine.com',
    siteName: 'DocFlowEngine',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DocFlowEngine - PDF to Word Converter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DocFlowEngine - Convert PDF to Word Online',
    description: 'Professional PDF to Word converter with complete privacy. Convert PDFs to editable DOCX files instantly.',
    images: ['/og-image.png'],
    creator: '@docflowengine',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Resource Preloading - Critical Assets */}
        {/* Preconnect to external domains for faster DNS resolution */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        {isAdSenseEnabled() && (
          <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        )}

        {/* Preload critical PDF.js worker - Heavy 1.3MB file */}
        <link 
          rel="preload" 
          href="/js/pdf.worker.min.mjs" 
          as="script" 
          type="module"
          crossOrigin="anonymous"
        />

        {/* Preload critical UI icons */}
        <link rel="preload" href="/file.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/window.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/globe.svg" as="image" type="image/svg+xml" />

        {/* Preload service worker for faster registration */}
        <link rel="preload" href="/sw.js" as="script" />

        {/* Prefetch non-critical assets that may be needed later */}
        <link rel="prefetch" href="/next.svg" as="image" type="image/svg+xml" />
        <link rel="prefetch" href="/vercel.svg" as="image" type="image/svg+xml" />

        {/* DNS prefetch for potential future resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        {isAdSenseEnabled() && (
          <link rel="dns-prefetch" href="//pagead2.googlesyndication.com" />
        )}

        {/* Preload critical CSS for faster rendering */}
        <link 
          rel="preload" 
          href="/globals.css" 
          as="style" 
        />

        {/* Structured Data for SEO */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "DocFlowEngine",
              "description": "Professional PDF to Word converter with complete privacy. Convert PDFs to editable DOCX files with images, tables, and formatting preserved.",
              "url": "https://docflowengine.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "PDF to Word conversion",
                "Privacy-focused processing",
                "No registration required",
                "Preserves formatting and images",
                "Supports tables and complex layouts",
                "Client-side processing"
              ],
              "browserRequirements": "Requires modern web browser with JavaScript enabled"
            })
          }}
        />

        {/* Google Analytics Script */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}

        {/* AdSense Script - Only load in production with valid client ID */}
        {isAdSenseEnabled() && (
          <Script
            async
            src={ADSENSE_SCRIPT_URL}
            data-ad-client={ADSENSE_CONFIG.CLIENT_ID}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerProvider>
          <ResourcePreloader />
          <OfflineIndicator />
          <ErrorBoundary>
            <ToastProvider>
              <GlobalErrorHandlerProvider />
              <ErrorReportingProvider>
                <AnalyticsProvider>
                  {children}
                  <PerformanceMonitor enableDevDashboard={process.env.NODE_ENV === 'development'} />
                </AnalyticsProvider>
              </ErrorReportingProvider>
            </ToastProvider>
          </ErrorBoundary>
        </ServiceWorkerProvider>
      </body>
    </html>
  );
}
