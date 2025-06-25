import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy, TextContent, TextItem } from 'pdfjs-dist/types/src/display/api';

// Configure pdf.js worker with robust fallback handling
if (typeof window !== 'undefined') {
  // For development (localhost), use local worker to avoid CORS issues
  // For production, CDN workers should work fine
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isLocalhost) {
    // Use local worker file for development
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.mjs';
    console.log('PDF.js worker: Using local worker file (development mode)');
  } else {
    // Use CDN for production
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
    console.log('PDF.js worker: Using CDN worker (production mode)');
  }
}

export interface PDFTextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  fontSize: number;
  isBold?: boolean;
  isItalic?: boolean;
  direction?: string;
}

export interface PDFImageItem {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  format: string; // 'JPEG', 'PNG', 'TIFF', etc.
  data: Uint8Array;
  blob?: Blob; // Processed image as blob
  originalFormat?: string;
}

export interface TableCell {
  content: string;
  rowIndex: number;
  colIndex: number;
  rowSpan?: number;
  colSpan?: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TableRow {
  cells: TableCell[];
  y: number;
  height: number;
}

export interface PDFTable {
  id: string;
  rows: TableRow[];
  pageNumber: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  columnCount: number;
  rowCount: number;
}

export interface TableDetectionOptions {
  minRows: number;           // Minimum number of rows to consider as table
  minCols: number;           // Minimum number of columns to consider as table
  borderDetectionThreshold: number;  // Sensitivity for border detection
  cellSpacingTolerance: number;      // Tolerance for cell spacing variations
  alignmentTolerance: number;        // Tolerance for text alignment detection
}

export interface PDFPageContent {
  pageNumber: number;
  textItems: PDFTextItem[];
  images: PDFImageItem[];
  tables: PDFTable[];
  rawText: string;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  keywords?: string;
}

export interface PDFParseResult {
  pages: PDFPageContent[];
  totalPages: number;
  metadata: PDFMetadata;
  fullText: string;
  images: PDFImageItem[]; // All images from all pages
  tables: PDFTable[]; // All tables from all pages
}

export class PDFParseError extends Error {
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'PDFParseError';
    if (originalError) {
      this.originalError = originalError;
    }
  }
}

/**
 * Extracts text content from a PDF file
 * @param file - The PDF file to parse
 * @returns Promise<PDFParseResult> - Parsed PDF content
 */
export async function parsePDF(file: File): Promise<PDFParseResult> {
  console.log('🔍 Starting PDF parsing...', { 
    fileName: file.name, 
    fileSize: file.size, 
    fileType: file.type 
  });

  try {
    // Enhanced file validation
    if (!file) {
      throw new PDFParseError('No file provided for parsing.');
    }

    if (file.size === 0) {
      throw new PDFParseError('File is empty. Please select a valid PDF file.');
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      throw new PDFParseError('File is too large. Please select a PDF file smaller than 100MB.');
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new PDFParseError('Invalid file type. Please select a PDF file.');
    }

    console.log('✅ File validation passed');

    // Convert file to array buffer with error handling
    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
      console.log('✅ File converted to ArrayBuffer', { size: arrayBuffer.byteLength });
    } catch (error) {
      throw new PDFParseError('Failed to read file. The file may be corrupted or inaccessible.', error instanceof Error ? error : undefined);
    }

    // Validate ArrayBuffer
    if (arrayBuffer.byteLength === 0) {
      throw new PDFParseError('File appears to be empty or corrupted.');
    }

    // Check for PDF signature
    const uint8Array = new Uint8Array(arrayBuffer.slice(0, 4));
    const signature = String.fromCharCode(...uint8Array);
    if (signature !== '%PDF') {
      throw new PDFParseError('File does not appear to be a valid PDF. PDF files must start with "%PDF".');
    }

    console.log('✅ PDF signature validated');
    
    // Load PDF document with enhanced error handling
    let pdf: PDFDocumentProxy;
    try {
      pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        // Enhanced configuration for better language and formatting support
        verbosity: 0, // Reduce console output
        standardFontDataUrl: undefined, // Let PDF.js handle font loading
        useSystemFonts: true, // Enable system fonts for better language support
        disableFontFace: false, // Enable custom fonts for better formatting
        useWorkerFetch: false, // Don't use worker for fetching
        isEvalSupported: false, // Security: disable eval
        maxImageSize: 16777216, // 16MB max image size
        cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/', // Character maps for international text
        cMapPacked: true, // Use packed character maps for efficiency
        enableXfa: false, // Disable XFA forms for security
        // Additional error handling options
        stopAtErrors: false, // Continue processing even if some pages fail
        fontExtraProperties: true, // Get additional font properties
        password: '', // Handle password-protected PDFs gracefully
      }).promise;
      
      console.log('✅ PDF document loaded successfully', { 
        numPages: pdf.numPages
      });
    } catch (error) {
      console.error('❌ PDF loading failed:', error);
      
      // Provide specific error messages for common PDF issues
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Invalid PDF structure')) {
        throw new PDFParseError('The PDF file appears to be corrupted or has an invalid structure.');
      } else if (errorMessage.includes('password')) {
        throw new PDFParseError('This PDF is password-protected. Please provide an unprotected PDF file.');
      } else if (errorMessage.includes('worker')) {
        throw new PDFParseError('PDF processing worker failed to load. Please try refreshing the page.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        throw new PDFParseError('Network error while loading PDF resources. Please check your internet connection.');
      } else {
        throw new PDFParseError(`Failed to load PDF document: ${errorMessage}`, error instanceof Error ? error : undefined);
      }
    }

    // Extract metadata
    const metadata = await extractMetadata(pdf);
    
    // Extract content from all pages
    const pages: PDFPageContent[] = [];
    const allImages: PDFImageItem[] = [];
    const allTables: PDFTable[] = [];
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const pageContent = await extractPageContent(pdf, pageNum);
      pages.push(pageContent);
      allImages.push(...pageContent.images);
      allTables.push(...pageContent.tables);
      fullText += pageContent.rawText + '\n\n';
    }

    const result = {
      pages,
      totalPages: pdf.numPages,
      metadata,
      fullText: fullText.trim(),
      images: allImages,
      tables: allTables
    };

    return result;

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
 * Extract metadata from PDF document
 */
async function extractMetadata(pdf: PDFDocumentProxy): Promise<PDFMetadata> {
  try {
    const metadata = await pdf.getMetadata();
    const info = metadata.info as Record<string, unknown>; // Type assertion for PDF metadata
    
    const result: PDFMetadata = {};
    
    if (typeof info.Title === 'string') result.title = info.Title;
    if (typeof info.Author === 'string') result.author = info.Author;
    if (typeof info.Subject === 'string') result.subject = info.Subject;
    if (typeof info.Creator === 'string') result.creator = info.Creator;
    if (typeof info.Producer === 'string') result.producer = info.Producer;
    if (typeof info.Keywords === 'string') result.keywords = info.Keywords;
    if (info.CreationDate) result.creationDate = new Date(info.CreationDate as string);
    if (info.ModDate) result.modificationDate = new Date(info.ModDate as string);
    
    return result;
  } catch {
    // Return empty metadata if extraction fails
    return {};
  }
}

// Image processing cache for performance optimization
const imageCache = new Map<string, Blob>();

// Configuration for image processing optimizations
const IMAGE_PROCESSING_CONFIG = {
  MAX_CACHE_SIZE: 50, // Maximum number of cached images
  MAX_IMAGE_SIZE: 4096, // Maximum width/height for processing
  BATCH_SIZE: 5, // Number of images to process in parallel
  QUALITY_THRESHOLDS: {
    SMALL: { pixels: 100000, quality: 0.95 }, // High quality for small images
    MEDIUM: { pixels: 500000, quality: 0.85 }, // Medium quality for medium images
    LARGE: { pixels: 1000000, quality: 0.75 }, // Lower quality for large images
  }
};

/**
 * Generate cache key for image
 */
function generateImageCacheKey(
  imageData: Uint8Array,
  width: number,
  height: number,
  targetFormat: string,
  quality: number
): string {
  // Create a simple hash based on image properties and first/last bytes
  const dataHash = imageData.length > 0 
    ? `${imageData[0]}-${imageData[imageData.length - 1]}-${imageData.length}`
    : '0-0-0';
  return `${width}x${height}-${targetFormat}-${quality}-${dataHash}`;
}

/**
 * Clean image cache when it gets too large
 */
function cleanImageCache(): void {
  if (imageCache.size > IMAGE_PROCESSING_CONFIG.MAX_CACHE_SIZE) {
    // Remove oldest entries (simple FIFO)
    const keysToRemove = Array.from(imageCache.keys()).slice(
      0, 
      imageCache.size - IMAGE_PROCESSING_CONFIG.MAX_CACHE_SIZE + 10
    );
    keysToRemove.forEach(key => imageCache.delete(key));
    console.log(`🧹 Cleaned image cache: removed ${keysToRemove.length} entries`);
  }
}

/**
 * Determine optimal quality based on image size
 */
function getOptimalQuality(width: number, height: number): number {
  const pixels = width * height;
  const { QUALITY_THRESHOLDS } = IMAGE_PROCESSING_CONFIG;
  
  if (pixels <= QUALITY_THRESHOLDS.SMALL.pixels) {
    return QUALITY_THRESHOLDS.SMALL.quality;
  } else if (pixels <= QUALITY_THRESHOLDS.MEDIUM.pixels) {
    return QUALITY_THRESHOLDS.MEDIUM.quality;
  } else {
    return QUALITY_THRESHOLDS.LARGE.quality;
  }
}

/**
 * Resize image if it exceeds maximum dimensions
 */
function calculateOptimalDimensions(width: number, height: number): { width: number; height: number } {
  const maxSize = IMAGE_PROCESSING_CONFIG.MAX_IMAGE_SIZE;
  
  if (width <= maxSize && height <= maxSize) {
    return { width, height };
  }
  
  // Calculate scaling factor to fit within max dimensions
  const scale = Math.min(maxSize / width, maxSize / height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale)
  };
}

/**
 * Convert image data to standard format (PNG or JPEG) with performance optimizations
 */
async function convertImageToStandardFormat(
  imageData: Uint8Array, 
  width: number, 
  height: number, 
  format: string,
  targetFormat: 'PNG' | 'JPEG' = 'PNG',
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // Determine optimal quality if not provided
      const optimalQuality = quality ?? getOptimalQuality(width, height);
      
      // Calculate optimal dimensions to prevent memory issues
      const optimalDimensions = calculateOptimalDimensions(width, height);
      const finalWidth = optimalDimensions.width;
      const finalHeight = optimalDimensions.height;
      
      // Check cache first
      const cacheKey = generateImageCacheKey(imageData, finalWidth, finalHeight, targetFormat, optimalQuality);
      const cachedBlob = imageCache.get(cacheKey);
      if (cachedBlob) {
        console.log(`🎯 Cache hit for image: ${finalWidth}x${finalHeight}`);
        resolve(cachedBlob);
        return;
      }
      
      // Create canvas element for image processing
      const canvas = document.createElement('canvas');
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas 2D context'));
        return;
      }

      // Handle different source formats
      if (format === 'JPEG' && targetFormat === 'JPEG') {
        // JPEG to JPEG: can often use data directly
        try {
          const blob = new Blob([imageData], { type: 'image/jpeg' });
          resolve(blob);
          return;
        } catch {
          // Fall through to canvas conversion if direct conversion fails
        }
      }

      // Create ImageData object for canvas
      const imageDataObj = ctx.createImageData(width, height);
      
      // Handle different input formats
      if (format === 'JPEG') {
        // For JPEG, we need to decode it first
        const img = new Image();
        const blob = new Blob([imageData], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        
        img.onload = () => {
          // Scale image to optimal dimensions if needed
          ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
          URL.revokeObjectURL(url);
          
          // Convert to target format
          const mimeType = targetFormat === 'JPEG' ? 'image/jpeg' : 'image/png';
          canvas.toBlob((result) => {
            if (result) {
              // Cache the result
              imageCache.set(cacheKey, result);
              cleanImageCache();
              resolve(result);
            } else {
              reject(new Error('Failed to convert image to blob'));
            }
          }, mimeType, targetFormat === 'JPEG' ? optimalQuality : undefined);
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load JPEG image'));
        };
        
        img.src = url;
      } else {
                // For other formats (PNG, RAW), process pixel data directly
        if (imageData.length === width * height * 4) {
          // RGBA format - scale if needed
          if (finalWidth !== width || finalHeight !== height) {
            // Create temporary canvas for scaling
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              const tempImageData = tempCtx.createImageData(width, height);
              tempImageData.data.set(imageData);
              tempCtx.putImageData(tempImageData, 0, 0);
              ctx.drawImage(tempCanvas, 0, 0, finalWidth, finalHeight);
            }
          } else {
            imageDataObj.data.set(imageData);
          }
        } else if (imageData.length === width * height * 3) {
          // RGB format - convert to RGBA and scale if needed
                    const rgbaData = new Uint8ClampedArray(width * height * 4);
          for (let i = 0; i < width * height; i++) {
            const srcIndex = i * 3;
            const dstIndex = i * 4;
            rgbaData[dstIndex] = imageData[srcIndex] ?? 0;     // R
            rgbaData[dstIndex + 1] = imageData[srcIndex + 1] ?? 0; // G
            rgbaData[dstIndex + 2] = imageData[srcIndex + 2] ?? 0; // B
            rgbaData[dstIndex + 3] = 255; // A (fully opaque)
          }
          
          if (finalWidth !== width || finalHeight !== height) {
            // Create temporary canvas for scaling
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              const tempImageData = tempCtx.createImageData(width, height);
              tempImageData.data.set(rgbaData);
              tempCtx.putImageData(tempImageData, 0, 0);
              ctx.drawImage(tempCanvas, 0, 0, finalWidth, finalHeight);
            }
          } else {
            imageDataObj.data.set(rgbaData);
          }
         } else {
           // Grayscale or other format - convert to RGBA
           const bytesPerPixel = imageData.length / (width * height);
           for (let i = 0; i < width * height; i++) {
             const srcIndex = Math.floor(i * bytesPerPixel);
             const dstIndex = i * 4;
             const gray = imageData[srcIndex] ?? 0;
             imageDataObj.data[dstIndex] = gray;     // R
             imageDataObj.data[dstIndex + 1] = gray; // G
             imageDataObj.data[dstIndex + 2] = gray; // B
             imageDataObj.data[dstIndex + 3] = 255;  // A
           }
         }
        
        // Put image data on canvas
        ctx.putImageData(imageDataObj, 0, 0);
        
        // Convert to target format
        const mimeType = targetFormat === 'JPEG' ? 'image/jpeg' : 'image/png';
        canvas.toBlob((result) => {
          if (result) {
            // Cache the result
            imageCache.set(cacheKey, result);
            cleanImageCache();
            resolve(result);
          } else {
            reject(new Error('Failed to convert image to blob'));
          }
        }, mimeType, targetFormat === 'JPEG' ? optimalQuality : undefined);
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Process multiple images in batches for better performance
 */
async function processImagesBatch(images: PDFImageItem[]): Promise<PDFImageItem[]> {
  const processedImages: PDFImageItem[] = [];
  const batchSize = IMAGE_PROCESSING_CONFIG.BATCH_SIZE;
  
  console.log(`🔄 Processing ${images.length} images in batches of ${batchSize}...`);
  
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    const batchPromises = batch.map(image => processExtractedImage(image));
    
    try {
      const batchResults = await Promise.all(batchPromises);
      processedImages.push(...batchResults);
      console.log(`✅ Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(images.length / batchSize)}`);
    } catch (error) {
      console.warn(`⚠️ Batch processing failed for batch starting at index ${i}:`, error);
      // Process individually as fallback
      for (const image of batch) {
        try {
          const processed = await processExtractedImage(image);
          processedImages.push(processed);
        } catch (individualError) {
          console.warn(`⚠️ Failed to process individual image ${image.id}:`, individualError);
          processedImages.push(image); // Add original image as fallback
        }
      }
    }
  }
  
  return processedImages;
}

/**
 * Process extracted image and convert to standard format with blob
 */
async function processExtractedImage(imageItem: PDFImageItem): Promise<PDFImageItem> {
  try {
    console.log(`🔄 Processing image: ${imageItem.id} (${imageItem.format})`);
    
    // Convert to PNG by default (lossless), or JPEG for large images
    const targetFormat = (imageItem.width * imageItem.height > 1000000) ? 'JPEG' : 'PNG';
    
    const blob = await convertImageToStandardFormat(
      imageItem.data,
      imageItem.width,
      imageItem.height,
      imageItem.format,
      targetFormat,
      0.85 // JPEG quality
    );
    
    // Return updated image item with blob
    const processedImage: PDFImageItem = {
      ...imageItem,
      blob,
      format: targetFormat // Update format to reflect conversion
    };
    
    console.log(`✅ Processed image: ${imageItem.id} -> ${targetFormat} (${blob.size} bytes)`);
    return processedImage;
    
  } catch (error) {
    console.warn(`⚠️ Failed to process image ${imageItem.id}:`, error);
    // Return original image without blob on conversion failure
    return imageItem;
  }
}

/**
 * Extract images from a single PDF page using PDF.js operator list
 */
async function extractImagesFromPage(page: PDFPageProxy, pageNumber: number): Promise<PDFImageItem[]> {
  const images: PDFImageItem[] = [];
  
  try {
    console.log(`🖼️ Extracting images from page ${pageNumber}...`);
    
    // Get the operator list to find image operations
    const operatorList = await page.getOperatorList();
    
    // Track transform matrix for positioning
    let currentTransform = [1, 0, 0, 1, 0, 0]; // Default identity matrix
    
    for (let i = 0; i < operatorList.fnArray.length; i++) {
      const fn = operatorList.fnArray[i];
      const args = operatorList.argsArray[i];
      
             // Track transform operations for positioning
       if (fn === pdfjsLib.OPS.transform) {
         // Update current transform matrix with proper type checking
         const [a, b, c, d, e, f] = args as number[];
         currentTransform = [a || 1, b || 0, c || 0, d || 1, e || 0, f || 0];
       }
      
      // Look for image painting operations
      if (fn === pdfjsLib.OPS.paintImageXObject) {
        const imageId = args[0];
        
        try {
          // Get the image object from the page's object store
          const imageObj = await page.objs.get(imageId);
          
          if (imageObj && imageObj.data) {
            // Determine image format
            let format = 'Unknown';
            let originalFormat = 'Unknown';
            
            if (imageObj.kind === 'Image') {
              // Try to determine format from image properties
              if (imageObj.compression === 'JPEG') {
                format = 'JPEG';
                originalFormat = 'JPEG';
              } else if (imageObj.compression === 'FLATE') {
                format = 'PNG';
                originalFormat = 'PNG';
              } else if (imageObj.colorSpace && imageObj.bitsPerComponent) {
                // Default to PNG for uncompressed images
                format = 'PNG';
                originalFormat = 'RAW';
              }
            }
            
                         // Extract positioning from transform matrix with proper defaults
             const x = typeof currentTransform[4] === 'number' ? currentTransform[4] : 0;
             const y = typeof currentTransform[5] === 'number' ? currentTransform[5] : 0;
             const width = typeof imageObj.width === 'number' ? imageObj.width : 0;
             const height = typeof imageObj.height === 'number' ? imageObj.height : 0;
             
             // Skip invalid images
             if (width <= 0 || height <= 0) {
               console.warn(`⚠️ Skipping invalid image ${imageId}: invalid dimensions ${width}x${height}`);
               continue;
             }
             
             const imageItem: PDFImageItem = {
               id: `page_${pageNumber}_img_${images.length + 1}`,
               pageNumber,
               x,
               y,
               width,
               height,
               format,
               originalFormat,
               data: imageObj.data
             };
             
             // Store raw image for batch processing
             images.push(imageItem);
             console.log(`✅ Extracted image: ${imageItem.id} (${width}x${height}, ${format})`);
          }
        } catch (error) {
          console.warn(`⚠️ Failed to extract image ${imageId} from page ${pageNumber}:`, error);
          // Continue processing other images
        }
      }
    }
    
    console.log(`✅ Extracted ${images.length} images from page ${pageNumber}`);
    return images;
    
  } catch (error) {
    console.warn(`⚠️ Failed to extract images from page ${pageNumber}:`, error);
    return []; // Return empty array on error, don't fail the entire parsing
  }
}

/**
 * Extract content from a single PDF page
 */
async function extractPageContent(pdf: PDFDocumentProxy, pageNumber: number): Promise<PDFPageContent> {
  try {
    const page: PDFPageProxy = await pdf.getPage(pageNumber);
    const textContent: TextContent = await page.getTextContent();
    
    const textItems: PDFTextItem[] = [];
    let rawText = '';
    
    for (const item of textContent.items) {
      if ('str' in item) { // Type guard for TextItem
        const textItem = item as TextItem;
        
        // Extract font information
        const fontName = textItem.fontName || 'Unknown';
        const fontSize = textItem.height || 12;
        
        // Check for bold/italic styling (basic heuristic)
        const isBold = fontName.toLowerCase().includes('bold');
        const isItalic = fontName.toLowerCase().includes('italic') || fontName.toLowerCase().includes('oblique');
        
        const pdfTextItem: PDFTextItem = {
          text: textItem.str,
          x: textItem.transform[4],
          y: textItem.transform[5],
          width: textItem.width,
          height: textItem.height,
          fontName,
          fontSize,
          isBold,
          isItalic,
          direction: textItem.dir || 'ltr'
        };
        
        textItems.push(pdfTextItem);
        rawText += textItem.str;
        
        // Add space if this item doesn't end with whitespace and the next item is on the same line
        if (!textItem.str.endsWith(' ') && !textItem.str.endsWith('\n')) {
          rawText += ' ';
        }
      }
    }
    
    // Clean up the raw text
    rawText = rawText
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/ +\n/g, '\n') // Remove spaces before newlines
      .replace(/\n +/g, '\n') // Remove spaces after newlines
      .trim();
    
    // Extract images from the page
    const rawImages = await extractImagesFromPage(page, pageNumber);
    
    // Process images in batches for better performance
    const images = rawImages.length > 0 ? await processImagesBatch(rawImages) : [];

    // Detect and extract tables from the page
    const tables = await detectTables(page, pageNumber);

    return {
      pageNumber,
      textItems,
      images,
      tables,
      rawText
    };
  } catch (error) {
    throw new PDFParseError(
      `Failed to extract content from page ${pageNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
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

/**
 * Simple table detection for basic table structures
 */
async function detectTables(
  page: PDFPageProxy, 
  pageNumber: number
): Promise<PDFTable[]> {
  const tables: PDFTable[] = [];
  
  try {
    console.log(`📊 Detecting tables on page ${pageNumber}...`);
    
    // Get text content for analysis
    const textContent = await page.getTextContent();
    const textItems = textContent.items.filter(item => 'str' in item) as TextItem[];
    
    if (textItems.length === 0) {
      console.log(`📊 No text items found on page ${pageNumber}, skipping table detection`);
      return tables;
    }
    
    // Simple table detection: look for aligned text patterns
    const simpleTable = await extractSimpleTable(textItems, pageNumber);
    if (simpleTable) {
      tables.push(simpleTable);
    }
    
    console.log(`📊 Detected ${tables.length} tables on page ${pageNumber}`);
    return tables;
    
  } catch (error) {
    console.warn(`⚠️ Failed to detect tables on page ${pageNumber}:`, error);
    return []; // Return empty array on error
  }
}

/**
 * Extract a simple table from text items
 */
async function extractSimpleTable(textItems: TextItem[], pageNumber: number): Promise<PDFTable | null> {
  // Group items by Y position (rows)
  const rowMap = new Map<number, TextItem[]>();
  
  for (const item of textItems) {
    const y = Math.round(item.transform[5]);
    if (!rowMap.has(y)) {
      rowMap.set(y, []);
    }
    rowMap.get(y)?.push(item);
  }
  
  // Sort rows by Y position
  const sortedRows = Array.from(rowMap.entries())
    .sort(([a, ], [b, ]) => b - a) // Top to bottom
    .filter(([, items]) => items.length > 1); // Only rows with multiple items
  
  if (sortedRows.length < 2) {
    return null; // Need at least 2 rows for a table
  }
  
  // Create table structure
  const rows: TableRow[] = [];
  let maxCols = 0;
  
  for (let rowIndex = 0; rowIndex < sortedRows.length; rowIndex++) {
    const rowData = sortedRows[rowIndex];
    if (!rowData) continue;
    const [y, rowItems] = rowData;
    
    // Sort items in row by X position
    rowItems.sort((a, b) => a.transform[4] - b.transform[4]);
    
    const cells: TableCell[] = [];
    for (let colIndex = 0; colIndex < rowItems.length; colIndex++) {
      const item = rowItems[colIndex];
      if (!item) continue;
      
      const cell: TableCell = {
        content: item.str.trim(),
        rowIndex,
        colIndex,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width || 0,
        height: item.height || 0
      };
      
      cells.push(cell);
    }
    
    maxCols = Math.max(maxCols, cells.length);
    
    const row: TableRow = {
      cells,
      y,
      height: Math.max(...cells.map(c => c.height), 12)
    };
    
    rows.push(row);
  }
  
  if (rows.length < 2 || maxCols < 2) {
    return null; // Not enough structure for a table
  }
  
  // Calculate table bounds
  const allCells = rows.flatMap(row => row.cells);
  const minX = Math.min(...allCells.map(cell => cell.x));
  const maxX = Math.max(...allCells.map(cell => cell.x + cell.width));
  const minY = Math.min(...allCells.map(cell => cell.y));
  const maxY = Math.max(...allCells.map(cell => cell.y + cell.height));
  
  const table: PDFTable = {
    id: `page_${pageNumber}_table_1`,
    rows,
    pageNumber,
    position: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    },
    columnCount: maxCols,
    rowCount: rows.length
  };
  
  console.log(`✅ Extracted simple table: ${table.id} (${table.rowCount}x${table.columnCount})`);
  return table;
} 