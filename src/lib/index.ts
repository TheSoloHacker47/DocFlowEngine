// Import types for internal use
import type {
  ConversionOptions,
  ConversionProgress,
  ConversionResult
} from './pdfToWordConverter';

import { convertPdfToWord } from './pdfToWordConverter';

// Main PDF to Word conversion functionality
export {
  convertPdfToWord,
  validateConversionOptions,
  getSupportedFileTypes,
  isFileSupported,
  ConversionError
} from './pdfToWordConverter';

// Type definitions for consumers
export type {
  ConversionOptions,
  ConversionProgress,
  ConversionResult
} from './pdfToWordConverter';

// PDF parsing functionality (for advanced users)
export {
  parsePDF,
  isPDFFile,
  PDFParseError
} from './pdfParser';

export type {
  PDFParseResult,
  PDFPageContent,
  PDFTextItem
} from './pdfParser';

// Word document generation (for advanced users)
export {
  generateWordDocument,
  createSimpleWordDocument,
  WordGenerationError
} from './docxGenerator';

export type {
  WordDocumentOptions,
  WordGenerationResult
} from './docxGenerator';

// Re-export utility types from main types file
export type {
  FileUploadState,
  ConversionState,
  ConversionResult as TypeConversionResult,
  ConversionFormat,
  ConversionOptions as TypeConversionOptions,
  ApiResponse,
  BaseComponentProps
} from '../types';

/**
 * Default conversion options for common use cases
 */
export const DEFAULT_CONVERSION_OPTIONS: ConversionOptions = {
  preserveFormatting: true,
  includeMetadata: true,
  includePageNumbers: true,
  includeHeaders: true,
  includeFooters: true,
  fontSize: 11,
  fontFamily: 'Calibri',
  lineSpacing: 1.15,
  simpleMode: false,
  enableProgressCallback: true
};

/**
 * Simple conversion options for basic text extraction
 */
export const SIMPLE_CONVERSION_OPTIONS: ConversionOptions = {
  preserveFormatting: false,
  includeMetadata: false,
  includePageNumbers: false,
  includeHeaders: false,
  includeFooters: false,
  fontSize: 12,
  fontFamily: 'Times New Roman',
  lineSpacing: 1.0,
  simpleMode: true,
  enableProgressCallback: true
};

/**
 * High-quality conversion options for professional documents
 */
export const PROFESSIONAL_CONVERSION_OPTIONS: ConversionOptions = {
  preserveFormatting: true,
  includeMetadata: true,
  includePageNumbers: true,
  includeHeaders: true,
  includeFooters: true,
  fontSize: 11,
  fontFamily: 'Calibri',
  lineSpacing: 1.15,
  margins: {
    top: 1,
    bottom: 1,
    left: 1,
    right: 1
  },
  simpleMode: false,
  enableProgressCallback: true
};

/**
 * Quick conversion function with default options
 * @param file - PDF file to convert
 * @param progressCallback - Optional progress callback
 * @returns Promise<ConversionResult> - Conversion result
 */
export async function quickConvert(
  file: File,
  progressCallback?: (progress: ConversionProgress) => void
): Promise<ConversionResult> {
  return convertPdfToWord(file, DEFAULT_CONVERSION_OPTIONS, progressCallback);
}

/**
 * Simple text-only conversion function
 * @param file - PDF file to convert
 * @param progressCallback - Optional progress callback
 * @returns Promise<ConversionResult> - Conversion result
 */
export async function simpleConvert(
  file: File,
  progressCallback?: (progress: ConversionProgress) => void
): Promise<ConversionResult> {
  return convertPdfToWord(file, SIMPLE_CONVERSION_OPTIONS, progressCallback);
}

/**
 * Professional conversion function with high-quality output
 * @param file - PDF file to convert
 * @param progressCallback - Optional progress callback
 * @returns Promise<ConversionResult> - Conversion result
 */
export async function professionalConvert(
  file: File,
  progressCallback?: (progress: ConversionProgress) => void
): Promise<ConversionResult> {
  return convertPdfToWord(file, PROFESSIONAL_CONVERSION_OPTIONS, progressCallback);
}

/**
 * Utility function to download the converted Word document
 * @param blob - Word document blob
 * @param filename - Optional filename (defaults to 'converted-document.docx')
 */
export function downloadWordDocument(blob: Blob, filename: string = 'converted-document.docx'): void {
  // Ensure the filename has the correct extension
  const finalFilename = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Utility function to get file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Utility function to format conversion time
 * @param milliseconds - Time in milliseconds
 * @returns Formatted time string
 */
export function formatConversionTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  } else if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
} 