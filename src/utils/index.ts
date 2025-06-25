/**
 * Check if a file is a PDF
 */
export function isPDF(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Format processing time in milliseconds to human readable format
 */
export function formatProcessingTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

/**
 * Generate a safe filename for download
 */
export function generateSafeFilename(originalName: string): string {
  // Remove or replace invalid characters
  let safeName = originalName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') // Replace invalid characters with underscore
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
  
  // Ensure it's not empty
  if (!safeName) {
    safeName = 'converted_document';
  }
  
  // Ensure proper extension
  if (!safeName.toLowerCase().endsWith('.docx')) {
    safeName = safeName.replace(/\.(pdf|doc|txt)$/i, '') + '.docx';
  }
  
  // Limit length to avoid filesystem issues
  if (safeName.length > 100) {
    const extension = '.docx';
    safeName = safeName.substring(0, 100 - extension.length) + extension;
  }
  
  return safeName;
}

/**
 * Download a file with given content and filename
 */
export function downloadFile(content: Blob, filename: string): void {
  console.log('📥 Starting file download...', { 
    filename, 
    blobSize: content?.size || 0, 
    blobType: content?.type || 'unknown' 
  });

  try {
    // Enhanced validation
    if (!content) {
      throw new Error('No file content provided for download');
    }

    if (content.size === 0) {
      throw new Error('File appears to be empty - conversion may have failed');
    }

    if (content.size > 500 * 1024 * 1024) { // 500MB limit
      throw new Error('Generated file is too large to download');
    }

    if (!filename || filename.trim() === '') {
      throw new Error('No filename provided for download');
    }

    // Generate safe filename with proper extension and character handling
    const finalFilename = generateSafeFilename(filename);
    
    console.log('✅ Download validation passed', { finalFilename });

    // Ensure proper MIME type for Word documents
    const wordBlob = new Blob([content], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    // Create and configure download link
    const url = URL.createObjectURL(wordBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    link.style.display = 'none'; // Hide the link
    link.setAttribute('download', finalFilename); // Ensure download attribute is set
    
    // Add to DOM temporarily
    document.body.appendChild(link);
    
    // Trigger download with browser compatibility
    try {
      link.click();
      console.log('✅ Download initiated successfully');
    } catch (clickError) {
      // Fallback for browsers that don't support programmatic clicks
      console.warn('Click failed, trying alternative download method:', clickError);
      
      // Alternative: dispatch click event
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false
      });
      link.dispatchEvent(clickEvent);
      console.log('✅ Download initiated via event dispatch');
    }
    
    // Cleanup with proper error handling
    setTimeout(() => {
      try {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
        console.log('✅ Download cleanup completed');
      } catch (cleanupError) {
        console.warn('Cleanup warning (non-critical):', cleanupError);
      }
    }, 150); // Slightly longer delay for better compatibility
    
  } catch (error) {
    console.error('❌ Download failed:', error);
    
    // Enhanced error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown download error';
    
    if (errorMessage.includes('blob') || errorMessage.includes('content')) {
      throw new Error('File conversion failed - no valid content to download');
    } else if (errorMessage.includes('filename')) {
      throw new Error('Invalid filename for download');
    } else if (errorMessage.includes('size') || errorMessage.includes('large')) {
      throw new Error('File is too large to download');
    } else {
      throw new Error(`Download failed: ${errorMessage}`);
    }
  }
} 