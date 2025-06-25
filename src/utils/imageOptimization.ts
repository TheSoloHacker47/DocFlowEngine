/**
 * Image optimization utilities for DocFlowEngine
 * Provides helpers for generating blur placeholders, responsive images, and optimization settings
 */

// Generate a simple blur data URL for placeholder images
export const generateBlurDataURL = (width: number = 10, height: number = 10): string => {
  // Create a simple gradient blur placeholder
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Create a simple gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

// Static blur data URL for consistent placeholders
export const DEFAULT_BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

// Generate responsive image sizes based on breakpoints
export const generateResponsiveSizes = (breakpoints: { [key: string]: number }) => {
  const sizeEntries = Object.entries(breakpoints)
    .sort(([, a], [, b]) => a - b)
    .map(([name, width], index, array) => {
      if (index === array.length - 1) {
        return `${width}px`;
      }
      return `(max-width: ${width}px) 100vw`;
    });
  
  return sizeEntries.join(', ');
};

// Common responsive breakpoints for DocFlowEngine
export const RESPONSIVE_BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

// Generate sizes string for common use cases
export const RESPONSIVE_SIZES = {
  full: '100vw',
  half: '(max-width: 768px) 100vw, 50vw',
  third: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quarter: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw',
};

// Image quality settings for different use cases
export const IMAGE_QUALITY = {
  thumbnail: 60,
  preview: 75,
  full: 85,
  hero: 90,
} as const;

// Supported image formats in order of preference
export const SUPPORTED_FORMATS = ['image/avif', 'image/webp', 'image/jpeg', 'image/png'] as const;

// Check if WebP is supported in the browser
export const isWebPSupported = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Check if AVIF is supported in the browser
export const isAVIFSupported = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
  });
};

// Get the best supported image format
export const getBestImageFormat = async (): Promise<string> => {
  if (await isAVIFSupported()) return 'image/avif';
  if (await isWebPSupported()) return 'image/webp';
  return 'image/jpeg';
};

// Optimize image loading based on viewport and connection
export const shouldLazyLoad = (element: HTMLElement): boolean => {
  // Check if element is in viewport
  const rect = element.getBoundingClientRect();
  const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
  
  // Don't lazy load if already in viewport
  if (isInViewport) return false;
  
  // Check connection speed if available
  const connection = (navigator as any).connection;
  if (connection && connection.effectiveType === 'slow-2g') {
    return true; // Always lazy load on slow connections
  }
  
  return true; // Default to lazy loading
};

// Calculate optimal image dimensions based on container and device pixel ratio
export const calculateOptimalDimensions = (
  containerWidth: number,
  containerHeight: number,
  devicePixelRatio: number = window.devicePixelRatio || 1
) => {
  return {
    width: Math.ceil(containerWidth * devicePixelRatio),
    height: Math.ceil(containerHeight * devicePixelRatio),
  };
};

// Image preloading utility
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Batch preload multiple images
export const preloadImages = async (sources: string[]): Promise<void> => {
  try {
    await Promise.all(sources.map(preloadImage));
  } catch (error) {
    console.warn('Some images failed to preload:', error);
  }
}; 