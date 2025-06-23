'use client';

import React, { useState, useCallback, useRef } from 'react';
import { FileUploadState } from '@/types';
import { isPDF, formatFileSize } from '@/utils';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  maxFileSize?: number; // in MB
  disabled?: boolean;
  className?: string;
}

export default function FileUploader({
  onFileSelect,
  onFileRemove,
  maxFileSize = 10, // 10MB default
  disabled = false,
  className = '',
}: FileUploaderProps) {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    isUploading: false,
    progress: 0,
    error: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, [disabled]);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    if (!isPDF(file)) {
      return 'Please upload a PDF file only.';
    }
    
    const maxSizeBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxFileSize}MB. Current size: ${formatFileSize(file.size)}`;
    }
    
    return null;
  }, [maxFileSize]);

  // Process file selection
  const processFile = useCallback((file: File) => {
    const error = validateFile(file);
    
    if (error) {
      setUploadState(prev => ({
        ...prev,
        error,
        file: null,
      }));
      return;
    }

    setUploadState({
      file,
      isUploading: false,
      progress: 100,
      error: null,
    });
    
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0 && files[0]) {
      processFile(files[0]);
    }
  }, [disabled, processFile]);

  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = e.target.files;
    if (files && files.length > 0 && files[0]) {
      processFile(files[0]);
    }
  }, [disabled, processFile]);

  // Handle click to select file
  const handleClick = useCallback(() => {
    if (disabled || uploadState.file) return;
    fileInputRef.current?.click();
  }, [disabled, uploadState.file]);

  // Handle file removal
  const handleRemoveFile = useCallback(() => {
    setUploadState({
      file: null,
      isUploading: false,
      progress: 0,
      error: null,
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    onFileRemove?.();
  }, [onFileRemove]);

  // Clear error
  const clearError = useCallback(() => {
    setUploadState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* File Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : uploadState.file 
              ? 'border-green-500 bg-green-50' 
              : uploadState.error 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Upload Icon */}
        <div className="mb-4">
          {uploadState.file ? (
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : uploadState.error ? (
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ) : (
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </div>

        {/* Content */}
        {uploadState.file ? (
          <div className="space-y-2">
            <p className="text-lg font-medium text-green-700">File Selected</p>
            <p className="text-sm text-gray-600">{uploadState.file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(uploadState.file.size)}</p>
          </div>
        ) : uploadState.error ? (
          <div className="space-y-2">
            <p className="text-lg font-medium text-red-700">Upload Error</p>
            <p className="text-sm text-red-600">{uploadState.error}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearError();
              }}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              {isDragging ? 'Drop your PDF here' : 'Upload PDF File'}
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop your PDF file here, or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Maximum file size: {maxFileSize}MB
            </p>
          </div>
        )}
      </div>

      {/* File Actions */}
      {uploadState.file && (
        <div className="mt-4 flex justify-center space-x-4">
          <button
            onClick={handleRemoveFile}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Remove File
          </button>
          <button
            onClick={handleClick}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Choose Different File
          </button>
        </div>
      )}

      {/* File Info */}
      {uploadState.file && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">File Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <span className="ml-2 text-gray-900">{uploadState.file.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Size:</span>
              <span className="ml-2 text-gray-900">{formatFileSize(uploadState.file.size)}</span>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <span className="ml-2 text-gray-900">PDF Document</span>
            </div>
            <div>
              <span className="text-gray-500">Last Modified:</span>
              <span className="ml-2 text-gray-900">
                {new Date(uploadState.file.lastModified).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 