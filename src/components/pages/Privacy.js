import React from 'react';
import SEO from '../seo/SEO';

function Privacy() {
  const seoData = {
    title: "Privacy Policy - IOF",
    description: "Learn about how Intellectual Oasis Fellowship collects, uses, and protects your personal information. Read our privacy policy to understand your data rights.",
    keywords: "privacy policy, data protection, personal information, IOF privacy, data rights",
    image: "/images/privacy-og.jpg"
  };

  return (
    <>
      <SEO {...seoData} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              At Intellectual Oasis Fellowship (IOF), we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium mb-2">Personal Information</h3>
            <p className="text-gray-600 mb-4">We may collect personal information that you provide to us, including:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Name and contact information</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Payment information</li>
              <li>Educational background</li>
              <li>Profile information</li>
            </ul>

            <h3 className="text-xl font-medium mb-2">Usage Information</h3>
            <p className="text-gray-600 mb-4">We automatically collect information about your device and how you use our platform:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Device information</li>
              <li>IP address</li>
              <li>Browser type</li>
              <li>Pages visited</li>
              <li>Time spent on platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Provide and maintain our services</li>
              <li>Process your payments</li>
              <li>Send you important updates</li>
              <li>Improve our platform</li>
              <li>Communicate with you</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
            <p className="text-gray-600 mb-4">We may share your information with:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Service providers</li>
              <li>Payment processors</li>
              <li>Educational institutions</li>
              <li>Legal authorities when required</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
            <p className="text-gray-600 mb-4">
              We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
            <p className="text-gray-600 mb-4">
              Our platform is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-600">
              Email: privacy@iofellowship.org<br />
              Address: [Your Address]
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

export default Privacy; 