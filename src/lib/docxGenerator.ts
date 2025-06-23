import { 
  Document, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType,
  Packer,
  Table,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  convertInchesToTwip,
  ISectionOptions,
  IRunOptions
} from 'docx';

import type { PDFParseResult, PDFTextItem } from './pdfParser';

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
}

export interface WordGenerationResult {
  document: Document;
  blob: Blob;
  metadata: {
    pageCount: number;
    wordCount: number;
    characterCount: number;
    createdAt: Date;
  };
}

export class WordGenerationError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'WordGenerationError';
  }
}

/**
 * Generates a Word document from parsed PDF content
 * @param pdfContent - Parsed PDF content
 * @param options - Word document generation options
 * @returns Promise<WordGenerationResult> - Generated Word document
 */
export async function generateWordDocument(
  pdfContent: PDFParseResult,
  options: WordDocumentOptions = {}
): Promise<WordGenerationResult> {
  try {
    const {
      title = 'Converted Document',
      author = 'DocFlowEngine',
      subject = 'PDF to Word Conversion',
      includeMetadata = true,
      includePageNumbers = true,
      includeHeader = true,
      includeFooter = true,
      preserveFormatting = true,
      fontSize = 11,
      fontFamily = 'Calibri',
      lineSpacing = 1.15,
      margins = {}
    } = options;

    // Default margins in twips (1/20th of a point)
    const defaultMargins = {
      top: convertInchesToTwip(1),
      bottom: convertInchesToTwip(1),
      left: convertInchesToTwip(1),
      right: convertInchesToTwip(1),
      ...margins
    };

    // Create document sections
    const sections: ISectionOptions[] = [];

    // Create header if requested
    const headers = includeHeader ? {
      default: new Header({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: title,
                size: fontSize * 2,
                bold: true,
                color: '666666'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          })
        ]
      })
    } : undefined;

    // Create footer if requested
    const footers = includeFooter ? {
      default: new Footer({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: 'Converted from PDF • Page ',
                size: (fontSize - 1) * 2,
                color: '888888'
              }),
              ...(includePageNumbers ? [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: (fontSize - 1) * 2,
                  color: '888888'
                }),
                new TextRun({
                  text: ' of ',
                  size: (fontSize - 1) * 2,
                  color: '888888'
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  size: (fontSize - 1) * 2,
                  color: '888888'
                })
              ] : [])
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 }
          })
        ]
      })
    } : undefined;

    // Add title page if metadata is included
    if (includeMetadata && pdfContent.metadata) {
      const titlePageChildren = [
        new Paragraph({
          children: [
            new TextRun({
              text: pdfContent.metadata.title || title,
              size: (fontSize + 6) * 2,
              bold: true
            })
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      ];

      // Add metadata information
      if (pdfContent.metadata.author) {
        titlePageChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Author: ${pdfContent.metadata.author}`,
                size: fontSize * 2,
                italics: true
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          })
        );
      }

      if (pdfContent.metadata.subject) {
        titlePageChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Subject: ${pdfContent.metadata.subject}`,
                size: fontSize * 2
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          })
        );
      }

      if (pdfContent.metadata.creationDate) {
        titlePageChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Original Creation Date: ${pdfContent.metadata.creationDate.toLocaleDateString()}`,
                size: (fontSize - 1) * 2,
                color: '666666'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          })
        );
      }

      // Add conversion info
      titlePageChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Converted on: ${new Date().toLocaleDateString()}`,
              size: (fontSize - 1) * 2,
              color: '666666'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Total Pages: ${pdfContent.totalPages}`,
              size: fontSize * 2
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        })
      );

      sections.push({
        ...(headers && { headers }),
        ...(footers && { footers }),
        properties: {
          page: {
            margin: defaultMargins,
            pageNumbers: {
              start: 1,
              formatType: NumberFormat.DECIMAL
            }
          }
        },
        children: titlePageChildren
      });
    }

    // Process PDF pages and convert to Word content
    const contentChildren: (Paragraph | Table)[] = [];

    for (const page of pdfContent.pages) {
      // Add page break for pages after the first (if not the first section)
      if (page.pageNumber > 1 || includeMetadata) {
        contentChildren.push(
          new Paragraph({
            children: [new TextRun({ text: '', break: 1 })],
            pageBreakBefore: true
          })
        );
      }

      // Add page heading
      contentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Page ${page.pageNumber}`,
              size: (fontSize + 2) * 2,
              bold: true,
              color: '333333'
            })
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      // Convert page content to Word paragraphs
      if (preserveFormatting) {
        // Group text items by approximate lines based on Y position
        const lines = groupTextItemsByLines(page.textItems);
        
        for (const line of lines) {
          const paragraph = createFormattedParagraph(line, fontSize, fontFamily, lineSpacing);
          contentChildren.push(paragraph);
        }
      } else {
        // Simple text conversion
        const paragraphs = page.rawText.split('\n').filter(text => text.trim());
        
        for (const text of paragraphs) {
          if (text.trim()) {
            contentChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: text.trim(),
                    size: fontSize * 2,
                    font: fontFamily
                  })
                ],
                spacing: { 
                  line: Math.round(lineSpacing * 240),
                  lineRule: 'auto',
                  after: 120
                }
              })
            );
          }
        }
      }
    }

    // Add content section
    const contentSectionOptions: ISectionOptions = {
      ...((!includeMetadata && headers) ? { headers } : {}),
      ...((!includeMetadata && footers) ? { footers } : {}),
      properties: {
        page: {
          margin: defaultMargins,
          pageNumbers: includeMetadata ? {
            start: 2,
            formatType: NumberFormat.DECIMAL
          } : {
            start: 1,
            formatType: NumberFormat.DECIMAL
          }
        }
      },
      children: contentChildren
    };

    sections.push(contentSectionOptions);

    // Create the document
    const document = new Document({
      creator: author,
      title: pdfContent.metadata.title || title,
      description: subject,
      sections
    });

    // Generate blob
    const blob = await Packer.toBlob(document);

    // Calculate metadata
    const wordCount = estimateWordCount(pdfContent.fullText);
    const characterCount = pdfContent.fullText.length;

    return {
      document,
      blob,
      metadata: {
        pageCount: pdfContent.totalPages,
        wordCount,
        characterCount,
        createdAt: new Date()
      }
    };

  } catch (error) {
    throw new WordGenerationError(
      `Failed to generate Word document: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Groups text items by approximate lines based on Y position
 */
function groupTextItemsByLines(textItems: PDFTextItem[]): PDFTextItem[][] {
  if (!textItems.length) return [];

  // Sort by Y position (top to bottom) then X position (left to right)
  const sortedItems = [...textItems].sort((a, b) => b.y - a.y || a.x - b.x);
  
  const lines: PDFTextItem[][] = [];
  let currentLine: PDFTextItem[] = [];
  let currentY: number | null = null;
  const lineThreshold = 5; // Pixels tolerance for same line

  for (const item of sortedItems) {
    if (currentY === null || Math.abs(item.y - currentY) <= lineThreshold) {
      // Same line or first item
      currentLine.push(item);
      currentY = item.y;
    } else {
      // New line
      if (currentLine.length > 0) {
        lines.push([...currentLine]);
      }
      currentLine = [item];
      currentY = item.y;
    }
  }

  // Add the last line
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Creates a formatted paragraph from a line of text items
 */
function createFormattedParagraph(
  lineItems: PDFTextItem[],
  baseFontSize: number,
  fontFamily: string,
  lineSpacing: number
): Paragraph {
  // Sort items by X position (left to right)
  const sortedItems = [...lineItems].sort((a, b) => a.x - b.x);
  
  const textRuns: TextRun[] = [];
  
  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    const nextItem = sortedItems[i + 1];
    
    if (!item) continue;
    
    // Create text run with formatting
    const runOptions: IRunOptions = {
      text: item.text,
      size: Math.max(item.fontSize * 2, baseFontSize * 2), // Convert to half-points
      font: fontFamily,
      // Apply basic formatting based on font size
      bold: item.fontSize > baseFontSize + 2 // Likely a heading
    };

    textRuns.push(new TextRun(runOptions));
    
    // Add space between items if there's a significant gap
    if (nextItem && (nextItem.x - (item.x + item.width)) > 10) {
      textRuns.push(new TextRun({ text: ' ' }));
    }
  }

  return new Paragraph({
    children: textRuns,
    spacing: {
      line: Math.round(lineSpacing * 240),
      lineRule: 'auto',
      after: 120
    }
  });
}

/**
 * Estimates word count from text
 */
function estimateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Creates a simple Word document with basic formatting
 * @param text - Plain text content
 * @param title - Document title
 * @returns Promise<Blob> - Generated Word document blob
 */
export async function createSimpleWordDocument(
  text: string,
  title: string = 'Converted Document'
): Promise<Blob> {
  try {
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    const children = [
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            size: 28,
            bold: true
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 }
      }),
      ...paragraphs.map(paragraph => 
        new Paragraph({
          children: [
            new TextRun({
              text: paragraph.trim(),
              size: 22
            })
          ],
          spacing: { after: 200 }
        })
      )
    ];

    const document = new Document({
      sections: [{
        children
      }]
    });

    return await Packer.toBlob(document);
  } catch (error) {
    throw new WordGenerationError(
      `Failed to create simple Word document: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
} 