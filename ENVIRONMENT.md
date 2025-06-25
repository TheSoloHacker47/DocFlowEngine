# Environment Variables Configuration

This document outlines the environment variables required for DocFlowEngine's SEO optimization and analytics features.

## Required Variables

### Site Configuration
```bash
NEXT_PUBLIC_SITE_URL=https://docflowengine.com
```
- **Purpose**: Base URL for canonical URLs, Open Graph tags, and sitemap generation
- **Required**: Yes for production SEO
- **Default**: Falls back to `https://docflowengine.com` if not set

### Analytics & Tracking
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```
- **Purpose**: Google Analytics tracking ID for user analytics
- **Required**: Optional, but recommended for production
- **Format**: Google Analytics 4 property ID (starts with G-)

### AdSense Configuration
```bash
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
```
- **Purpose**: Google AdSense client ID for monetization
- **Required**: Optional, only if using AdSense
- **Format**: AdSense publisher ID (starts with ca-pub-)

## Optional Variables

### Error Reporting
```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```
- **Purpose**: Error tracking and monitoring with Sentry
- **Required**: Optional, but recommended for production

### Search Engine Verification
```bash
GOOGLE_VERIFICATION_CODE=your-google-verification-code
YANDEX_VERIFICATION_CODE=your-yandex-verification-code
YAHOO_VERIFICATION_CODE=your-yahoo-verification-code
```
- **Purpose**: Verify site ownership with search engines
- **Required**: Optional, used for search console setup

## Setup Instructions

1. Copy the environment variables to your `.env.local` file (for local development) or configure them in your deployment platform
2. Replace placeholder values with your actual credentials
3. Restart your development server after making changes
4. Verify that the variables are loaded correctly by checking the browser's network tab for proper URLs and tracking codes

## SEO Impact

These environment variables directly affect:
- **Canonical URLs**: Proper canonical URL generation for SEO
- **Open Graph Tags**: Correct URLs for social media sharing
- **Sitemap Generation**: Absolute URLs in the sitemap.xml
- **Analytics Tracking**: User behavior tracking for optimization
- **Search Console**: Site verification and indexing status

## Security Notes

- Never commit actual API keys or sensitive values to version control
- Use `.env.local` for local development
- Configure environment variables through your hosting platform's dashboard
- The `NEXT_PUBLIC_` prefix makes variables available to the client-side code 