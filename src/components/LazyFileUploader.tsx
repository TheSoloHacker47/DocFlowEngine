'use client';

import { lazy, Suspense } from 'react';
import { ConversionState } from '@/types';

// Lazy load the FileUploader component
const FileUploader = lazy(() => import('./FileUploader'));

// Loading component for FileUploader
const FileUploaderSkeleton = () => (
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 animate-pulse">
    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
  </div>
  );

interface LazyFileUploaderProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onConvert: () => void;
  selectedFile: File | null;
  conversionState: ConversionState;
  disabled?: boolean;
  className?: string;
}

export default function LazyFileUploader(props: LazyFileUploaderProps) {
  return (
    <Suspense fallback={<FileUploaderSkeleton />}>
      <FileUploader {...props} />
    </Suspense>
  );
} 