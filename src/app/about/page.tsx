import { Metadata } from 'next';
import Layout from '@/components/Layout';
import Breadcrumb, { pageBreadcrumbs } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'About DocFlowEngine - Our Mission & Technology | PDF to Word Converter',
  description: 'Learn about DocFlowEngine&apos;s mission to provide secure, high-quality PDF to Word conversion. Discover our client-side processing technology and commitment to privacy.',
  keywords: 'about DocFlowEngine, PDF converter technology, document conversion mission, privacy-focused converter, client-side processing',
  openGraph: {
    title: 'About DocFlowEngine - Our Mission & Technology',
    description: 'Learn about DocFlowEngine&apos;s mission to provide secure, high-quality PDF to Word conversion with complete privacy protection.',
    type: 'website',
  },
  twitter: {
    title: 'About DocFlowEngine - Our Mission & Technology',
    description: 'Learn about DocFlowEngine&apos;s mission to provide secure, high-quality PDF to Word conversion with complete privacy protection.',
  },
};

export default function AboutPage() {
  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Breadcrumb items={pageBreadcrumbs.about} className="mb-8" />
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              About Our PDF to Word Converter
            </h1>
            <p className="text-lg text-gray-600">
              A powerful, free, and secure tool designed to make document conversion seamless and efficient.
            </p>
          </div>
        </div>
      </div>
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We believe that converting documents should be straightforward, accessible to everyone, and completely secure. Our mission is to provide a reliable online service that delivers high-quality PDF to Word conversions without compromising your privacy. We&apos;ve engineered a tool that works entirely in your browser, ensuring your sensitive documents never leave your computer.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Us?</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Unmatched Quality</h3>
                  <p className="text-gray-600">
                    Our advanced conversion engine meticulously reconstructs your document, preserving complex layouts, tables, images, and fonts with high fidelity.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Blazing Fast Speed</h3>
                  <p className="text-gray-600">
                    No more waiting. Our tool leverages WebAssembly to perform conversions at near-native speeds, directly in your browser.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Ironclad Security & Privacy</h3>
                  <p className="text-gray-600">
                    Your files are never uploaded to a server. All processing is done on your local machine, guaranteeing that your data remains private and secure.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Completely Free</h3>
                  <p className="text-gray-600">
                    Get professional-grade conversions without any cost. No subscriptions, no hidden fees, and no registration required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 