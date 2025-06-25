'use client';

import { lazy, Suspense } from 'react';

// Lazy load ad components
const HeaderBanner = lazy(() => import('./ads/HeaderBanner'));
const SidebarAd = lazy(() => import('./ads/SidebarAd'));
const FooterBanner = lazy(() => import('./ads/FooterBanner'));

// Loading skeletons for ads
const AdSkeleton = ({ height = 'h-24' }: { height?: string }) => (
  <div className={`bg-gray-100 ${height} rounded-lg animate-pulse flex items-center justify-center`}>
    <div className="text-xs text-gray-400">Advertisement</div>
  </div>
);

// Lazy Header Banner
export function LazyHeaderBanner() {
  return (
    <Suspense fallback={<AdSkeleton height="h-20" />}>
      <HeaderBanner />
    </Suspense>
  );
}

// Lazy Sidebar Ad
export function LazySidebarAd() {
  return (
    <Suspense fallback={<AdSkeleton height="h-96" />}>
      <SidebarAd />
    </Suspense>
  );
}

// Lazy Footer Banner
export function LazyFooterBanner() {
  return (
    <Suspense fallback={<AdSkeleton height="h-24" />}>
      <FooterBanner />
    </Suspense>
  );
} 