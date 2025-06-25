'use client';

import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import MetaTags from '@/components/MetaTags';
import JsonLd, { createHowToSchema, createFAQSchema } from '@/components/JsonLd';
import Breadcrumb, { pageBreadcrumbs } from '@/components/Breadcrumb';

// Scoped FAQItem component
interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={toggleOpen}
        className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800 focus:outline-none"
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </span>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : '0' }}
      >
        <div className="pt-4 text-gray-600 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
};


export default function HowToUsePage() {
  const faqs = [
    {
      question: 'Is this service really free?',
      answer: 'Yes, our PDF to Word converter is completely free to use. There are no hidden charges, and you don\'t need to register an account.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. All file processing happens directly in your web browser. Your files are never uploaded to our servers, ensuring your data remains private and secure on your own computer.',
    },
    {
      question: 'What file sizes can I convert?',
      answer: 'While the conversion happens in your browser, very large files (e.g., over 100MB) might be limited by your computer\'s memory. For best results, we recommend files under 50MB.',
    },
    {
      question: 'Will my formatting be preserved?',
      answer: 'Our conversion engine is designed to preserve your original formatting, including layouts, fonts, images, and tables, as accurately as possible. However, very complex PDFs may see minor differences.',
    },
    {
        question: 'Do I need to install any software?',
        answer: 'No software installation is required. Our tool is entirely web-based and works in all modern browsers like Chrome, Firefox, and Safari.'
    }
  ];

  const faqSchemaData = createFAQSchema(faqs);

  return (
    <>
      <MetaTags
        title="How to Use DocFlowEngine - PDF to Word Converter Guide | Step-by-Step Instructions"
        description="Learn how to convert PDF to Word documents with DocFlowEngine. Simple 3-step process: upload, convert, download. Includes FAQ and troubleshooting tips."
        keywords="how to convert PDF to Word, PDF converter guide, DocFlowEngine tutorial, PDF to DOCX instructions, document conversion steps"
        ogType="article"
      />
      <JsonLd data={createHowToSchema()} />
      <JsonLd data={faqSchemaData} />
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Breadcrumb items={pageBreadcrumbs['how-to-use']} className="mb-8" />
        <div className="max-w-4xl mx-auto">
          <section id="how-it-works" className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Simple, Fast, and Secure Conversion</h1>
            <p className="text-lg text-gray-600 mb-10">Convert your PDF to an editable Word document in three easy steps.</p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Your PDF</h3>
                <p className="text-gray-600">Drag and drop your file or click to select a PDF from your computer.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">2</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Convert with One Click</h3>
                <p className="text-gray-600">Our tool will instantly start converting your file right in your browser.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Download Your Word File</h3>
                <p className="text-gray-600">Your editable .docx file will be ready to download in seconds.</p>
              </div>
            </div>
          </section>
          
          <section id="faq">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
    </>
  );
} 