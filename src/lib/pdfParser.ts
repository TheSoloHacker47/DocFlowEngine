import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy, TextContent, TextItem } from 'pdfjs-dist/types/src/display/api';

// Configure pdf.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface PDFTextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  fontSize: number;
}

export interface PDFPageContent {
  pageNumber: number;
  textItems: PDFTextItem[];
  rawText: string;
  width: number;
  height: number;
}

export interface PDFParseResult {
  pages: PDFPageContent[];
  totalPages: number;
  metadata: {
    title?: string | undefined;
    author?: string | undefined;
    subject?: string | undefined;
    creator?: string | undefined;
    producer?: string | undefined;
    creationDate?: Date | undefined;
    modificationDate?: Date | undefined;
  };
  fullText: string;
}

export class PDFParseError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'PDFParseError';
  }
}

/**
 * Extracts text content from a PDF file
 * @param file - The PDF file to parse
 * @returns Promise<PDFParseResult> - Parsed PDF content
 */
export async function parsePDF(file: File): Promise<PDFParseResult> {
  try {
    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new PDFParseError('Invalid file type. Expected PDF file.');
    }

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      // Enable text extraction optimizations
      useSystemFonts: true,
      verbosity: 0 // Reduce console output
    }).promise;

    // Extract metadata
    const metadata = await extractMetadata(pdf);
    
    // Extract content from all pages
    const pages: PDFPageContent[] = [];
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const pageContent = await extractPageContent(pdf, pageNum);
      pages.push(pageContent);
      fullText += pageContent.rawText + '\n\n';
    }

    return {
      pages,
      totalPages: pdf.numPages,
      metadata,
      fullText: fullText.trim()
    };

  } catch (error) {
    if (error instanceof PDFParseError) {
      throw error;
    }
    throw new PDFParseError(
      `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Extracts content from a single PDF page
 */
async function extractPageContent(pdf: PDFDocumentProxy, pageNum: number): Promise<PDFPageContent> {
  try {
    const page: PDFPageProxy = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    
    // Get text content
    const textContent: TextContent = await page.getTextContent();
    
    // Process text items
    const textItems: PDFTextItem[] = textContent.items
      .filter((item): item is TextItem => 'str' in item && 'transform' in item)
      .map((item: TextItem) => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height,
        fontName: item.fontName,
        fontSize: Math.abs(item.transform[0]) // Extract font size from transform matrix
      }));

    // Extract raw text
    const rawText = textItems
      .sort((a, b) => b.y - a.y || a.x - b.x) // Sort by position (top to bottom, left to right)
      .map(item => item.text)
      .join(' ')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    return {
      pageNumber: pageNum,
      textItems,
      rawText,
      width: viewport.width,
      height: viewport.height
    };

  } catch (error) {
    throw new PDFParseError(
      `Failed to extract content from page ${pageNum}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

// Type for PDF metadata info object
interface PDFMetadataInfo {
  Title?: string;
  Author?: string;
  Subject?: string;
  Creator?: string;
  Producer?: string;
  CreationDate?: string;
  ModDate?: string;
}

/**
 * Extracts metadata from PDF document
 */
async function extractMetadata(pdf: PDFDocumentProxy) {
  try {
    const metadata = await pdf.getMetadata();
    const info = metadata.info as PDFMetadataInfo;
    
    return {
      title: info?.Title || undefined,
      author: info?.Author || undefined,
      subject: info?.Subject || undefined,
      creator: info?.Creator || undefined,
      producer: info?.Producer || undefined,
      creationDate: info?.CreationDate ? new Date(info.CreationDate) : undefined,
      modificationDate: info?.ModDate ? new Date(info.ModDate) : undefined
    };
  } catch {
    // Return empty metadata if extraction fails
    return {
      title: undefined,
      author: undefined,
      subject: undefined,
      creator: undefined,
      producer: undefined,
      creationDate: undefined,
      modificationDate: undefined
    };
  }
}

/**
 * Utility function to check if a file is a valid PDF
 */
export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Utility function to get PDF page count without full parsing
 */
export async function getPDFPageCount(file: File): Promise<number> {
  try {
    if (!isPDFFile(file)) {
      throw new PDFParseError('Invalid file type. Expected PDF file.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
  } catch (error) {
    throw new PDFParseError(
      `Failed to get PDF page count: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
} 