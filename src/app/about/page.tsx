import Layout from '@/components/Layout';

export default function AboutPage() {
  return (
    <Layout title="About - DocFlowEngine">
      <div className="px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About DocFlowEngine</h1>
          
          <div className="prose prose-lg text-gray-700">
            <p className="mb-6">
              DocFlowEngine is a simple, fast, and secure tool for converting PDF documents 
              to various formats including Word documents, plain text, and HTML.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="mb-6">
              We believe that document conversion should be simple, accessible, and secure. 
              Our goal is to provide a reliable service that respects your privacy while 
              delivering high-quality conversions.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features</h2>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>Fast and accurate PDF to Word conversion</li>
              <li>Support for multiple output formats</li>
              <li>Secure processing - files are not stored</li>
              <li>Easy-to-use drag and drop interface</li>
              <li>Free to use with no registration required</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy & Security</h2>
            <p>
              Your privacy is important to us. All file processing happens locally in your 
              browser, and we do not store or transmit your documents to external servers.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 