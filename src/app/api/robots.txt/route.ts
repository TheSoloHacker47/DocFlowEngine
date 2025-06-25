import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://docflowengine.com';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Disallow private/admin areas
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

# Allow important API endpoints for SEO
Allow: /api/sitemap.xml
Allow: /api/robots.txt

# Sitemap location
Sitemap: ${SITE_URL}/api/sitemap.xml

# Crawl delay (optional - helps prevent overwhelming the server)
Crawl-delay: 1

# Specific rules for different user agents
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
    },
  });
} 