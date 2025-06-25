// Common types for the DocFlowEngine application

export interface FileUploadState {
  file: File | null;
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export interface ConversionState {
  status: 'idle' | 'processing' | 'success' | 'error';
  progress: number;
  error: string | null;
  result: unknown | null; // Will be typed as ConversionResult from library in usage
}

export interface ConversionResult {
  success: boolean;
  blob?: Blob;
  metadata?: {
    originalTitle?: string;
    originalAuthor?: string;
    originalPages?: number;
    convertedPages?: number;
    wordCount?: number;
    characterCount?: number;
    conversionTime?: number;
    createdAt?: Date;
    pages?: number;
    fileName?: string;
    fileSize?: number;
    processingTime?: number;
  };
  error?: string;
  warnings?: string[];
  downloadUrl?: string;
}

export type ConversionFormat = 'docx' | 'txt' | 'html';

export interface ConversionOptions {
  format: ConversionFormat;
  preserveFormatting: boolean;
  includeImages: boolean;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
} 