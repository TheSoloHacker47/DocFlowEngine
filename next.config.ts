import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable experimental features for better code splitting
  experimental: {
    optimizePackageImports: [
      '@/components',
      '@/lib',
      '@/utils'
    ],
  },
  
  // Configure webpack for better code splitting
  webpack: (config, { dev, isServer }) => {
    // Enable better tree shaking
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    };

    // Split chunks more aggressively
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Separate PDF.js into its own chunk since it's large
          pdfjs: {
            test: /[\\/]node_modules[\\/]pdfjs-dist[\\/]/,
            name: 'pdfjs',
            chunks: 'all',
            priority: 30,
          },
          // Separate DOCX library into its own chunk
          docx: {
            test: /[\\/]node_modules[\\/]docx[\\/]/,
            name: 'docx',
            chunks: 'all',
            priority: 30,
          },
          // Common vendor chunk for smaller libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 20,
            minSize: 20000,
            maxSize: 250000,
          },
          // Component chunks
          components: {
            test: /[\\/]src[\\/]components[\\/]/,
            name: 'components',
            chunks: 'all',
            priority: 10,
            minSize: 10000,
          },
        },
      };
    }

    return config;
  },

  // Enable compression and other optimizations
  compress: true,
  poweredByHeader: false,
  
  // Advanced image optimization
  images: {
    // Format optimization - prioritize modern formats
    formats: ['image/avif', 'image/webp'],
    
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Caching and performance
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    
    // SVG support with security
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // Loader configuration for external images
    domains: [], // Add external domains here if needed
    
    // Unoptimized fallback for development
    unoptimized: false,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
