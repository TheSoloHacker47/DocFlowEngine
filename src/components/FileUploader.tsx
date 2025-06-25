'use client';

import React, { useCallback, useRef } from 'react';
import { ConversionState } from '@/types';
import { isPDF, formatFileSize } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, File, XCircle, RefreshCcw } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onConvert: () => void;
  selectedFile: File | null;
  conversionState: ConversionState;
}

export default function FileUploader({
  onFileSelect,
  onFileRemove,
  onConvert,
  selectedFile,
  conversionState,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (conversionState.status === 'processing') return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, [conversionState.status]);

  const processFile = useCallback((file: File) => {
    if (!isPDF(file)) {
      // Maybe show a toast here instead of relying on parent state
      return;
    }
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (conversionState.status === 'processing') return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [conversionState.status, processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const renderContent = () => {
    if (conversionState.status === 'processing') {
      return (
        <div className="text-center">
          <p className="mb-2">Converting...</p>
          <Progress value={conversionState.progress} className="w-full" />
        </div>
      );
    }

    if (conversionState.status === 'error') {
      return (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Conversion Failed</AlertTitle>
          <AlertDescription>
            {conversionState.error || 'An unknown error occurred.'}
          </AlertDescription>
          <Button variant="link" size="sm" onClick={onFileRemove} className="mt-2">
            Try again
          </Button>
        </Alert>
      );
    }

    if (selectedFile) {
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm">
            <File className="h-5 w-5" />
            <span className="font-medium truncate" data-testid="selected-file-name">{selectedFile.name}</span>
            <span className="text-gray-500">{formatFileSize(selectedFile.size)}</span>
          </div>
          <div className="flex justify-center space-x-4">
             <Button onClick={onConvert} data-testid="convert-button">Convert to Word</Button>
             <Button variant="outline" onClick={onFileRemove}>Remove</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center space-y-2">
        <Upload className="mx-auto h-10 w-10 text-gray-400" />
        <p className="font-semibold">Click to upload or drag and drop</p>
        <p className="text-xs text-gray-500">Select a PDF file to get started</p>
      </div>
    );
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={selectedFile ? undefined : handleClick}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 
      ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
      ${!selectedFile && 'cursor-pointer hover:border-gray-400'}`}
    >
      <Input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
        disabled={conversionState.status === 'processing'}
      />
      {renderContent()}
    </div>
  );
} 