import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  convertInchesToTwip
} from 'docx';

import type { PDFParseResult, PDFImageItem, PDFTable } from './pdfParser';

export interface ImagePositionOptions {
  alignment?: 'left' | 'center' | 'right';
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  textWrapping?: 'inline' | 'square' | 'tight';
  floating?: boolean;
}

export interface WordDocumentOptions {
  title?: string;
  author?: string;
  subject?: string;
  includeMetadata?: boolean;
  includePageNumbers?: boolean;
  includeHeader?: boolean;
  includeFooter?: boolean;
  preserveFormatting?: boolean;
  fontSize?: number;
  fontFamily?: string;
  lineSpacing?: number;
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  imageOptions?: ImagePositionOptions;
}

export interface WordGenerationResult {
  success: boolean;
  blob: Blob;
  metadata: {
    pageCount: number;
    wordCount: number;
    characterCount: number;
    createdAt: Date;
  };
}

export class WordGenerationError extends Error {
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'WordGenerationError';
    if (originalError) {
      this.originalError = originalError;
    }
  }
}

/**
 * Convert image blob to buffer for docx processing
 */
async function convertImageBlobToBuffer(imageBlob: Blob): Promise<Buffer> {
  const arrayBuffer = await imageBlob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Calculate optimal image dimensions for Word document
 */
function calculateWordImageDimensions(width: number, height: number, maxWidth = 500): { width: number; height: number } {
  if (width <= maxWidth) {
    return { width, height };
  }
  
  const aspectRatio = height / width;
  return {
    width: maxWidth,
    height: Math.round(maxWidth * aspectRatio)
  };
}

/**
 * Get alignment type for docx based on string value
 */
function getAlignmentType(alignment: string): typeof AlignmentType[keyof typeof AlignmentType] {
  switch (alignment.toLowerCase()) {
    case 'left':
      return AlignmentType.LEFT;
    case 'center':
      return AlignmentType.CENTER;
    case 'right':
      return AlignmentType.RIGHT;
    default:
      return AlignmentType.LEFT;
  }
}

/**
 * Create an ImageRun with advanced positioning options
 */
function createImageRun(
  imageBuffer: Buffer,
  width: number,
  height: number,
  format: string
): ImageRun {
  // Use the basic ImageRun constructor
  return new ImageRun({
    data: imageBuffer,
    transformation: {
      width,
      height,
    },
    type: format === 'JPEG' ? 'jpg' : 'png'
  });
}

/**
 * Generate error placeholder for failed image processing
 */
function createImageErrorPlaceholder(errorMessage: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `[Image could not be loaded: ${errorMessage}]`,
        italics: true,
        color: '999999'
      })
    ],
    spacing: {
      before: 200,
      after: 200
    }
  });
}

/**
 * Process image with comprehensive error handling
 */
async function processImageSafely(
  image: PDFImageItem,
  options: ImagePositionOptions = {}
): Promise<Paragraph> {
  try {
    if (!image.blob) {
      console.warn(`⚠️ Image ${image.id} has no blob data`);
      return createImageErrorPlaceholder('No image data available');
    }

    // Convert image blob to buffer
    const imageBuffer = await convertImageBlobToBuffer(image.blob);
    
    // Calculate optimal dimensions
    const dimensions = calculateWordImageDimensions(image.width, image.height);
    
    // Create image run with positioning options
    const imageRun = createImageRun(
      imageBuffer,
      dimensions.width,
      dimensions.height,
      image.format
    );

    // Create paragraph with alignment and spacing
    const alignment = options.alignment ? getAlignmentType(options.alignment) : AlignmentType.LEFT;
    
    return new Paragraph({
      children: [imageRun],
      alignment,
      spacing: {
        before: convertInchesToTwip(options.margins?.top || 0.1),
        after: convertInchesToTwip(options.margins?.bottom || 0.1),
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Failed to process image ${image.id}:`, error);
    return createImageErrorPlaceholder(errorMessage);
  }
}

/**
 * Create a Word table from PDF table data
 */
function createWordTable(pdfTable: PDFTable): Table {
  try {
    console.log(`📊 Creating Word table: ${pdfTable.id} (${pdfTable.rowCount}x${pdfTable.columnCount})`);
    
    // Create table rows
    const tableRows: TableRow[] = [];
    
    for (const pdfRow of pdfTable.rows) {
      // Create table cells for this row
      const tableCells: TableCell[] = [];
      
      for (const pdfCell of pdfRow.cells) {
        const tableCell = new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: pdfCell.content || '',
                  size: 20 // 10pt font
                })
              ]
            })
          ],
          width: {
            size: Math.max(pdfCell.width * 20, 1000), // Convert to twips with minimum width
            type: WidthType.DXA
          }
        });
        
        tableCells.push(tableCell);
      }
      
      // Ensure all rows have the same number of cells (pad with empty cells if needed)
      while (tableCells.length < pdfTable.columnCount) {
        tableCells.push(new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: '', size: 20 })] })],
          width: { size: 1000, type: WidthType.DXA }
        }));
      }
      
      const tableRow = new TableRow({
        children: tableCells
      });
      
      tableRows.push(tableRow);
    }
    
    // Create the table with proper styling
    const table = new Table({
      rows: tableRows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      borders: {
        top: { style: 'single', size: 1, color: '000000' },
        bottom: { style: 'single', size: 1, color: '000000' },
        left: { style: 'single', size: 1, color: '000000' },
        right: { style: 'single', size: 1, color: '000000' },
        insideHorizontal: { style: 'single', size: 1, color: '000000' },
        insideVertical: { style: 'single', size: 1, color: '000000' }
      }
    });
    
    console.log(`✅ Successfully created Word table: ${pdfTable.id}`);
    return table;
    
  } catch (error) {
    console.error(`❌ Failed to create Word table ${pdfTable.id}:`, error);
    // Return a simple error table
    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `[Table could not be created: ${error instanceof Error ? error.message : 'Unknown error'}]`,
                      italics: true,
                      color: '999999'
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    });
  }
}

/**
 * Process table with error handling
 */
function processTableSafely(table: PDFTable): Table {
  try {
    return createWordTable(table);
  } catch (error) {
    console.error(`❌ Failed to process table ${table.id}:`, error);
    // Return error placeholder table
    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `[Table processing failed: ${table.id}]`,
                      italics: true,
                      color: '999999'
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    });
  }
}

/**
 * Generate a simple Word document from processed PDF content with images
 */
export async function createSimpleWordDocument(
  content: PDFParseResult,
  options: Partial<WordDocumentOptions> = {}
): Promise<WordGenerationResult> {
  try {
    console.log(`📄 Creating Word document with ${content.images.length} images...`);
    
    // Create document elements
    const documentChildren: (Paragraph | Table)[] = [];
    
    // Process content page by page to maintain order
    for (let pageNum = 1; pageNum <= content.totalPages; pageNum++) {
      const page = content.pages.find(p => p.pageNumber === pageNum);
      if (!page) continue;
      
      // Add page text content
      if (page.rawText.trim()) {
        const textParagraphs = page.rawText
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => new Paragraph({
            children: [
              new TextRun({
                text: line.trim(),
                font: options.fontFamily || 'Times New Roman',
                size: (options.fontSize || 12) * 2, // Convert to half-points
              })
            ]
          }));
        
        documentChildren.push(...textParagraphs);
      }
      
      // Add page images
      const pageImages = page.images.filter(img => img.blob);
      if (pageImages.length > 0) {
        console.log(`🖼️ Adding ${pageImages.length} images from page ${pageNum}...`);
        
        for (const image of pageImages) {
          try {
            if (!image.blob) continue;
            
            // Process image with comprehensive error handling
            const imageParagraph = await processImageSafely(image, options.imageOptions || {});
            
            documentChildren.push(imageParagraph);
            console.log(`✅ Added image: ${image.id} (${image.width}x${image.height})`);
            
          } catch (imageError) {
            console.warn(`⚠️ Failed to add image ${image.id}:`, imageError);
            // Continue with other images
          }
        }
      }

      // Add page tables
      const pageTables = page.tables || [];
      if (pageTables.length > 0) {
        console.log(`📊 Adding ${pageTables.length} tables from page ${pageNum}...`);
        
        for (const table of pageTables) {
          try {
            // Process table with comprehensive error handling
            const wordTable = processTableSafely(table);
            
            documentChildren.push(wordTable);
            console.log(`✅ Added table: ${table.id} (${table.rowCount}x${table.columnCount})`);
            
            // Add spacing after table
            documentChildren.push(new Paragraph({
              children: [new TextRun({ text: '' })],
              spacing: { after: 200 }
            }));
            
          } catch (tableError) {
            console.warn(`⚠️ Failed to add table ${table.id}:`, tableError);
            // Continue with other tables
          }
        }
      }
      
      // Add page break between pages (except for last page)
      if (pageNum < content.totalPages) {
        documentChildren.push(new Paragraph({
          children: [new TextRun({ text: '', break: 1 })]
        }));
      }
    }
    
    // Fallback: if no content was processed, use the full text
    if (documentChildren.length === 0) {
      const fallbackParagraphs = content.fullText
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => new Paragraph({
          children: [
            new TextRun({
              text: line.trim(),
              font: options.fontFamily || 'Times New Roman',
              size: (options.fontSize || 12) * 2,
            })
          ]
        }));
      
      documentChildren.push(...fallbackParagraphs);
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: documentChildren
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });

    console.log(`✅ Word document created successfully with ${content.images.length} images and ${content.tables.length} tables`);

    return {
      success: true,
      blob,
      metadata: {
        pageCount: content.totalPages,
        wordCount: content.fullText.split(/\s+/).length,
        characterCount: content.fullText.length,
        createdAt: new Date()
      }
    };

  } catch (error) {
    throw new WordGenerationError(
      `Failed to create simple Word document: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Generate a Word document from processed PDF content
 */
export async function generateWordDocument(
  content: PDFParseResult,
  options: WordDocumentOptions = {}
): Promise<WordGenerationResult> {
  try {
    // For now, use the simple approach
    return await createSimpleWordDocument(content, options);
  } catch (error) {
    throw new WordGenerationError(
      `Failed to generate Word document: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

 