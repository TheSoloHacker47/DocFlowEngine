'use client';

import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import JsonLd, { createWebApplicationSchema, createHowToSchema, createOrganizationSchema } from '@/components/JsonLd';
import LazyFileUploader from '@/components/LazyFileUploader';
import { ConversionState } from '@/types';
import { 
  loadConversionEngine,
  type ConversionResult 
} from '@/lib/LazyConversionEngine';
import { downloadFile, formatProcessingTime, generateSafeFilename } from '@/utils';
import { useToast } from '@/components/ToastContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trackConversionStart, trackConversionComplete, trackDownload, trackError } from '@/lib/analytics';

export default function HomePage() {
  const [conversionState, setConversionState] = useState<ConversionState>({
    status: 'idle',
    progress: 0,
    error: null,
    result: null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const { showSuccess, showError } = useToast();

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setConversionState({ status: 'idle', progress: 0, error: null, result: null });
    setProcessingTime(0);
  }, []);

  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    setConversionState({ status: 'idle', progress: 0, error: null, result: null });
    setProcessingTime(0);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!selectedFile) return;

    setConversionState({ status: 'processing', progress: 0, error: null, result: null });
    const startTime = performance.now();
    trackConversionStart(selectedFile.size, selectedFile.name);

    try {
      const { convertPdfToWord } = await loadConversionEngine();
      const result = await convertPdfToWord(selectedFile, {}, (progress) => {
        setConversionState((prevState) => ({ ...prevState, progress: progress.progress ?? 0 }));
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      setProcessingTime(duration);

      setConversionState({ status: 'success', progress: 100, error: null, result });
      showSuccess('Conversion successful!');
      trackConversionComplete(duration, selectedFile.size, true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setConversionState({ status: 'error', progress: 0, error: error.message, result: null });
      showError(`Conversion failed: ${error.message}`);
      trackError('ConversionError', error.message, 'handleConvert');
    }
  }, [selectedFile, showSuccess, showError]);

  const handleDownload = useCallback(() => {
    const result = conversionState.result as ConversionResult;
    if (result && result.blob && selectedFile) {
      const safeFilename = generateSafeFilename(selectedFile.name);
      downloadFile(result.blob, safeFilename);
      trackDownload(safeFilename, result.blob.size);
    }
  }, [conversionState.result, selectedFile]);

  const renderSuccessState = () => (
    <div className="text-center space-y-4">
      <h3 className="text-xl font-semibold">Conversion Complete!</h3>
      <p className="text-sm text-gray-500">
        Processed in {formatProcessingTime(processingTime)}.
      </p>
      <Button onClick={handleDownload}>
        Download Word File
      </Button>
      <Button variant="link" onClick={() => handleFileRemove()}>
        Convert another file
      </Button>
    </div>
  );

  return (
    <>
      <Head>
        <JsonLd data={createWebApplicationSchema()} />
        <JsonLd data={createHowToSchema()} />
        <JsonLd data={createOrganizationSchema()} />
      </Head>
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <h1 className="text-3xl font-bold">PDF to Word Converter</h1>
            <CardDescription>
              Upload your PDF, convert it to a high-quality Word document, and download it in seconds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conversionState.status === 'success' ? (
              renderSuccessState()
            ) : (
              <LazyFileUploader
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                selectedFile={selectedFile}
                conversionState={conversionState}
                onConvert={handleConvert}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
    </>
  );
}
