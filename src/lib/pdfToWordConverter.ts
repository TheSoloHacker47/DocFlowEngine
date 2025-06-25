import { parsePDF, PDFParseResult, PDFParseError } from './pdfParser';
import { 
  generateWordDocument, 
  createSimpleWordDocument,
  WordDocumentOptions, 
  WordGenerationResult,
  WordGenerationError 
} from './docxGenerator';

export interface ConversionOptions {
  // Document options
  title?: string;
  author?: string;
  subject?: string;
  
  // Formatting options
  preserveFormatting?: boolean;
  includeMetadata?: boolean;
  includePageNumbers?: boolean;
  includeHeaders?: boolean;
  includeFooters?: boolean;
  
  // Style options
  fontSize?: number;
  fontFamily?: string;
  lineSpacing?: number;
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  
  // Processing options
  simpleMode?: boolean; // Use simple text extraction instead of advanced formatting
  enableProgressCallback?: boolean;
}

export interface ConversionProgress {
  stage: 'parsing' | 'processing' | 'generating' | 'complete';
  progress: number; // 0-100
  message: string;
  currentPage?: number | undefined;
  totalPages?: number | undefined;
}

export interface ConversionResult {
  success: boolean;
  blob?: Blob | undefined;
  metadata?: {
    originalTitle?: string | undefined;
    originalAuthor?: string | undefined;
    originalPages: number;
    convertedPages: number;
    wordCount: number;
    characterCount: number;
    conversionTime: number;
    createdAt: Date;
  } | undefined;
  error?: string | undefined;
  warnings?: string[] | undefined;
}

export class ConversionError extends Error {
  constructor(message: string, public cause?: Error, public stage?: string) {
    super(message);
    this.name = 'ConversionError';
  }
}

/**
 * Main PDF to Word conversion function
 * @param file - PDF file to convert
 * @param options - Conversion options
 * @param progressCallback - Optional progress callback function
 * @returns Promise<ConversionResult> - Conversion result
 */
export async function convertPdfToWord(
  file: File,
  options: ConversionOptions = {},
  progressCallback?: (progress: ConversionProgress) => void
): Promise<ConversionResult> {
  const startTime = Date.now();
  const warnings: string[] = [];
  
  // Progress callback helper
  const reportProgress = (stage: ConversionProgress['stage'], progress: number, message: string, currentPage?: number, totalPages?: number) => {
    if (options.enableProgressCallback !== false && progressCallback) {
      progressCallback({
        stage,
        progress,
        message,
        currentPage,
        totalPages
      });
    }
  };
  
  try {
    // Validate input
    if (!file) {
      throw new ConversionError('No file provided', undefined, 'validation');
    }
    
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new ConversionError('Invalid file type. Please provide a PDF file.', undefined, 'validation');
    }

    // Default options
    const {
      title,
      author,
      subject,
      preserveFormatting = true,
      includeMetadata = true,
      includePageNumbers = true,
      includeHeaders = true,
      includeFooters = true,
      fontSize = 11,
      fontFamily = 'Calibri',
      lineSpacing = 1.15,
      margins,
      simpleMode = false
    } = options;



    // Stage 1: Parse PDF
    reportProgress('parsing', 0, 'Starting PDF parsing...');
    
    let pdfContent: PDFParseResult;
    try {
      pdfContent = await parsePDF(file);
      reportProgress('parsing', 30, `Successfully parsed PDF with ${pdfContent.totalPages} pages`);
    } catch (error) {
      if (error instanceof PDFParseError) {
        throw new ConversionError(`PDF parsing failed: ${error.message}`, error, 'parsing');
      }
      throw new ConversionError('Unknown error during PDF parsing', error instanceof Error ? error : undefined, 'parsing');
    }

    // Stage 2: Process and validate content
    reportProgress('processing', 40, 'Processing PDF content...');
    
    const processedContent = await processAndValidateContent(pdfContent, warnings);
    reportProgress('processing', 60, 'Content processing complete');

    // Stage 3: Generate Word document
    reportProgress('generating', 70, 'Generating Word document...');
    
    let result: WordGenerationResult | Blob;
    
    if (simpleMode) {
      // Simple mode: just extract text and create basic Word document
      const documentTitle = title || processedContent.metadata.title || 'Converted Document';
      const wordOptions = {
        title: documentTitle,
        author: author || processedContent.metadata.author || 'DocFlowEngine',
        fontSize,
        fontFamily,
        lineSpacing
      };
      result = await createSimpleWordDocument(processedContent, wordOptions);
      
      // Create metadata for simple mode
      const simpleMetadata = {
        originalTitle: processedContent.metadata.title,
        originalAuthor: processedContent.metadata.author,
        originalPages: processedContent.totalPages,
        convertedPages: result.metadata.pageCount,
        wordCount: result.metadata.wordCount,
        characterCount: result.metadata.characterCount,
        conversionTime: Date.now() - startTime,
        createdAt: result.metadata.createdAt
      };
      
      reportProgress('complete', 100, 'Conversion complete (simple mode)');
      
      return {
        success: true,
        blob: result.blob,
        metadata: simpleMetadata,
        warnings: warnings.length > 0 ? warnings : undefined
      };
      
    } else {
             // Advanced mode: full formatting preservation
       const wordOptions: WordDocumentOptions = {
         title: title || processedContent.metadata.title || 'Converted Document',
         author: author || processedContent.metadata.author || 'DocFlowEngine',
         subject: subject || processedContent.metadata.subject || 'PDF to Word Conversion',
         includeMetadata,
         includePageNumbers,
         includeHeader: includeHeaders,
         includeFooter: includeFooters,
         preserveFormatting,
         fontSize,
         fontFamily,
         lineSpacing,
         ...(margins && { margins })
       };
      
      try {
        result = await generateWordDocument(processedContent, wordOptions);
        reportProgress('complete', 100, 'Conversion complete');
        
        return {
          success: true,
          blob: result.blob,
          metadata: {
            originalTitle: processedContent.metadata.title,
            originalAuthor: processedContent.metadata.author,
            originalPages: processedContent.totalPages,
            convertedPages: result.metadata.pageCount,
            wordCount: result.metadata.wordCount,
            characterCount: result.metadata.characterCount,
            conversionTime: Date.now() - startTime,
            createdAt: result.metadata.createdAt
          },
          warnings: warnings.length > 0 ? warnings : undefined
        };
        
      } catch (error) {
        if (error instanceof WordGenerationError) {
          throw new ConversionError(`Word document generation failed: ${error.message}`, error, 'generating');
        }
        throw new ConversionError('Unknown error during Word document generation', error instanceof Error ? error : undefined, 'generating');
      }
    }

  } catch (error) {
    reportProgress('complete', 100, 'Conversion failed');
    
    if (error instanceof ConversionError) {
      return {
        success: false,
        error: error.message,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    }
    
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }
}

/**
 * Process and validate PDF content, adding warnings for potential issues
 */
async function processAndValidateContent(
  pdfContent: PDFParseResult,
  warnings: string[]
): Promise<PDFParseResult> {
  // Check for empty content
  if (!pdfContent.fullText.trim()) {
    warnings.push('PDF appears to contain no extractable text content');
  }
  
  // Check for very short content
  if (pdfContent.fullText.trim().length < 100) {
    warnings.push('PDF contains very little text content - this may be an image-based PDF');
  }
  
  // Check for pages with no content
  const emptyPages = pdfContent.pages.filter(page => !page.rawText.trim()).length;
  if (emptyPages > 0) {
    warnings.push(`${emptyPages} page(s) appear to have no extractable text content`);
  }
  
  // Check for unusual page count
  if (pdfContent.totalPages > 100) {
    warnings.push('Large document detected - conversion may take longer than usual');
  }
  
  // Check for missing metadata
  if (!pdfContent.metadata.title && !pdfContent.metadata.author) {
    warnings.push('PDF metadata is limited - document may not have proper title/author information');
  }
  
  // Return the content (no modifications needed for now)
  return pdfContent;
}

/**
 * Estimate word count from text
 * @deprecated - This function is no longer used, but kept for potential future use
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function estimateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Utility function to validate conversion options
 */
export function validateConversionOptions(options: ConversionOptions): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (options.fontSize && (options.fontSize < 6 || options.fontSize > 72)) {
    errors.push('Font size must be between 6 and 72 points');
  }
  
  if (options.lineSpacing && (options.lineSpacing < 0.5 || options.lineSpacing > 3)) {
    errors.push('Line spacing must be between 0.5 and 3.0');
  }
  
  if (options.margins) {
    const { top, bottom, left, right } = options.margins;
    if (top && (top < 0 || top > 5)) errors.push('Top margin must be between 0 and 5 inches');
    if (bottom && (bottom < 0 || bottom > 5)) errors.push('Bottom margin must be between 0 and 5 inches');
    if (left && (left < 0 || left > 5)) errors.push('Left margin must be between 0 and 5 inches');
    if (right && (right < 0 || right > 5)) errors.push('Right margin must be between 0 and 5 inches');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get supported file types for validation
 */
export function getSupportedFileTypes(): string[] {
  return ['application/pdf', '.pdf'];
}

/**
 * Check if a file is supported for conversion
 */
export function isFileSupported(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
} 