import Layout from '@/components/Layout';

export default function PrivacyPolicyPage() {
  return (
    <Layout title="Privacy Policy - DocFlowEngine">
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <div className="prose prose-lg text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              <p>
                DocFlowEngine is designed with privacy in mind. We do not collect, store, or 
                transmit your personal documents or files. All file processing happens locally 
                in your browser.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>We may collect anonymous usage statistics to improve our service</li>
                <li>We use cookies for basic website functionality</li>
                <li>We do not sell or share personal information with third parties</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">File Processing</h2>
              <p>
                All PDF conversion happens locally in your browser using JavaScript libraries. 
                Your files are never uploaded to our servers or any external services. Once you 
                close your browser or navigate away from the page, all traces of your files are 
                automatically removed.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies</h2>
              <p>
                We use minimal cookies to ensure the website functions properly. These cookies 
                do not contain personal information and are used solely for technical purposes.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
              <p>
                We may use third-party services for analytics and advertising. These services 
                may use cookies and similar technologies. Please refer to their respective 
                privacy policies for more information.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us through 
                our contact page or email us at privacy@docflowengine.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
} 