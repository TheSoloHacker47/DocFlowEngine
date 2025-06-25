'use client';

import { useEffect } from 'react';
import { initializeGlobalErrorHandler } from '@/lib/errorHandler';

export default function GlobalErrorHandlerProvider() {
  useEffect(() => {
    // Initialize global error handler when component mounts
    initializeGlobalErrorHandler();
  }, []);

  // This component doesn't render anything
  return null;
} 