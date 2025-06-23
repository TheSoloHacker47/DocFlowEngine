import Layout from '@/components/Layout';

export default function TermsOfServicePage() {
  return (
    <Layout title="Terms of Service - DocFlowEngine">
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          
          <div className="prose prose-lg text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p>
                By accessing and using DocFlowEngine, you accept and agree to be bound by the 
                terms and provision of this agreement.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use License</h2>
              <p>
                Permission is granted to use DocFlowEngine for personal and commercial purposes. 
                This license shall automatically terminate if you violate any of these restrictions 
                and may be terminated by us at any time.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimer</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>The service is provided &quot;as is&quot; without any warranties</li>
                <li>We do not guarantee the accuracy of conversions</li>
                <li>We are not liable for any data loss or corruption</li>
                <li>Users are responsible for backing up their original files</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptable Use</h2>
              <p>You agree not to use the service to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Process illegal, harmful, or copyrighted content without permission</li>
                <li>Attempt to reverse engineer or compromise the service</li>
                <li>Use the service for any unlawful purpose</li>
                <li>Interfere with other users&apos; use of the service</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also 
                governs your use of the service, to understand our practices.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitations</h2>
              <p>
                In no event shall DocFlowEngine or its suppliers be liable for any damages 
                (including, without limitation, damages for loss of data or profit, or due to 
                business interruption) arising out of the use or inability to use the service.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Modifications</h2>
              <p>
                We reserve the right to revise these terms at any time without notice. By using 
                this service, you are agreeing to be bound by the then current version of these 
                terms of service.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at 
                legal@docflowengine.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
} 