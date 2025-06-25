// Lazy load the conversion engine
export const loadConversionEngine = async () => {
  const { convertPdfToWord } = await import('./pdfToWordConverter');
  return { convertPdfToWord };
};

// Lazy load PDF parser
export const loadPdfParser = async () => {
  const pdfParser = await import('./pdfParser');
  return pdfParser;
};

// Lazy load DOCX generator  
export const loadDocxGenerator = async () => {
  const docxGenerator = await import('./docxGenerator');
  return docxGenerator;
};

// Type for the conversion result
export type { ConversionResult } from './pdfToWordConverter'; 