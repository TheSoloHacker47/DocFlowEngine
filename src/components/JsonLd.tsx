import React from 'react';

interface JsonLdProps {
  data: Record<string, any>;
}

const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 2) }}
    />
  );
};

export default JsonLd;

// Common structured data schemas for DocFlowEngine
export const createWebApplicationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'DocFlowEngine',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Document Conversion',
  operatingSystem: 'Web Browser',
  url: 'https://docflowengine.com',
  description: 'Convert PDF documents to editable Word files with ease. Fast, accurate, and secure PDF to DOCX conversion tool.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free PDF to Word conversion service'
  },
  featureList: [
    'PDF to Word conversion',
    'Batch file processing',
    'Secure file handling',
    'High-quality output',
    'Fast processing'
  ],
  screenshot: 'https://docflowengine.com/images/screenshot.png',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
    bestRating: '5'
  },
  author: {
    '@type': 'Organization',
    name: 'DocFlowEngine',
    url: 'https://docflowengine.com'
  }
});

export const createOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'DocFlowEngine',
  url: 'https://docflowengine.com',
  logo: 'https://docflowengine.com/images/logo.png',
  description: 'Leading provider of document conversion tools and services.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    url: 'https://docflowengine.com/contact'
  },
  sameAs: [
    'https://twitter.com/DocFlowEngine',
    'https://facebook.com/DocFlowEngine',
    'https://linkedin.com/company/docflowengine'
  ]
});

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

export const createFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});

export const createHowToSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert PDF to Word Document',
  description: 'Step-by-step guide to convert PDF files to editable Word documents using DocFlowEngine.',
  image: 'https://docflowengine.com/images/how-to-convert.png',
  totalTime: 'PT2M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'USD',
    value: '0'
  },
  supply: [
    {
      '@type': 'HowToSupply',
      name: 'PDF file to convert'
    }
  ],
  tool: [
    {
      '@type': 'HowToTool',
      name: 'DocFlowEngine web application'
    }
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'Upload PDF file',
      text: 'Click the upload button and select your PDF file from your device.',
      image: 'https://docflowengine.com/images/step1-upload.png'
    },
    {
      '@type': 'HowToStep',
      name: 'Start conversion',
      text: 'Click the "Convert to Word" button to begin the conversion process.',
      image: 'https://docflowengine.com/images/step2-convert.png'
    },
    {
      '@type': 'HowToStep',
      name: 'Download result',
      text: 'Once conversion is complete, download your Word document.',
      image: 'https://docflowengine.com/images/step3-download.png'
    }
  ]
});

export const createWebPageSchema = (title: string, description: string, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description: description,
  url: url,
  inLanguage: 'en-US',
  isPartOf: {
    '@type': 'WebSite',
    name: 'DocFlowEngine',
    url: 'https://docflowengine.com'
  },
  author: {
    '@type': 'Organization',
    name: 'DocFlowEngine'
  },
  publisher: {
    '@type': 'Organization',
    name: 'DocFlowEngine',
    logo: {
      '@type': 'ImageObject',
      url: 'https://docflowengine.com/images/logo.png'
    }
  }
}); 