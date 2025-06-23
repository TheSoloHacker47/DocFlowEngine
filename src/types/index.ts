// Common types for the DocFlowEngine application

export interface FileUploadState {
  file: File | null;
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export interface ConversionState {
  isConverting: boolean;
  progress: number;
  error: string | null;
  result: ConversionResult | null;
}

export interface ConversionResult {
  success: boolean;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: number;
  processingTime?: number;
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