import React from 'react';
import SEO from '../seo/SEO';

function Terms() {
  const seoData = {
    title: "Terms of Service - IOF",
    description: "Read our terms of service to understand the rules, guidelines, and policies for using Intellectual Oasis Fellowship's platform and services.",
    keywords: "terms of service, legal terms, IOF terms, user agreement, platform rules",
    image: "/images/terms-og.jpg"
  };

  return (
    <>
      <SEO {...seoData} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing and using the Intellectual Oasis Fellowship (IOF) platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p className="text-gray-600 mb-4">
              Permission is granted to temporarily access and use IOF's platform for personal, non-commercial purposes only. This license does not include:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for commercial purposes</li>
              <li>Attempting to decompile or reverse engineer any software</li>
              <li>Removing any copyright or proprietary notations</li>
              <li>Transferring the materials to another person</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">
              To access certain features of the platform, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any security breaches</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Course Content</h2>
            <p className="text-gray-600 mb-4">
              All course content provided through our platform is protected by copyright and other intellectual property rights. Users may not:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Share or distribute course materials</li>
              <li>Record or capture course content</li>
              <li>Use course materials for commercial purposes</li>
              <li>Create derivative works from course content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
            <p className="text-gray-600 mb-4">
              By purchasing courses or services, you agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Provide valid payment information</li>
              <li>Pay all fees according to the pricing established</li>
              <li>Accept our refund policy as stated</li>
              <li>Authorize us to charge your payment method</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Disclaimer</h2>
            <p className="text-gray-600 mb-4">
              The materials on IOF's platform are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Limitations</h2>
            <p className="text-gray-600 mb-4">
              In no event shall IOF or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Revisions and Errata</h2>
            <p className="text-gray-600 mb-4">
              The materials appearing on our platform could include technical, typographical, or photographic errors. We do not warrant that any of the materials are accurate, complete, or current. We may make changes to the materials at any time without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
            <p className="text-gray-600 mb-4">
              These terms and conditions are governed by and construed in accordance with the laws of Nigeria and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the platform. Your continued use of the platform after such modifications constitutes your acceptance of the new terms.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

export default Terms; 