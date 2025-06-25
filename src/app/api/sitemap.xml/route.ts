import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://docflowengine.com';

interface SitemapUrl {
  url: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  lastmod?: string;
}

const staticPages: SitemapUrl[] = [
  { 
    url: '/', 
    changefreq: 'daily', 
    priority: 1.0,
    lastmod: new Date().toISOString()
  },
  { 
    url: '/about', 
    changefreq: 'monthly', 
    priority: 0.8,
    lastmod: new Date().toISOString()
  },
  { 
    url: '/contact', 
    changefreq: 'monthly', 
    priority: 0.7,
    lastmod: new Date().toISOString()
  },
  { 
    url: '/how-to-use', 
    changefreq: 'weekly', 
    priority: 0.9,
    lastmod: new Date().toISOString()
  },
  { 
    url: '/privacy-policy', 
    changefreq: 'yearly', 
    priority: 0.5,
    lastmod: new Date().toISOString()
  },
  { 
    url: '/terms-of-service', 
    changefreq: 'yearly', 
    priority: 0.5,
    lastmod: new Date().toISOString()
  },
];

const generateSitemap = (pages: SitemapUrl[]): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(({ url, changefreq, priority, lastmod }) => {
    return `  <url>
    <loc>${SITE_URL}${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
  </url>`;
  })
  .join('\n')}
</urlset>`;
};

export async function GET() {
  try {
    const sitemap = generateSitemap(staticPages);
    
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 