import React from 'react';
import SEO from '../seo/SEO';

function Cookies() {
  const seoData = {
    title: "Cookies Policy - IOF",
    description: "Learn about how Intellectual Oasis Fellowship uses cookies and similar technologies to enhance your browsing experience and improve our services.",
    keywords: "cookies policy, cookie usage, tracking technologies, IOF cookies, browser cookies",
    image: "/images/cookies-og.jpg"
  };

  return (
    <>
      <SEO {...seoData} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookies Policy</h1>
          <p className="text-xl text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
            <p className="text-gray-600 mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. They help us provide you with a better experience by enabling us to monitor which pages you find useful and which you do not.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-600 mb-4">We use cookies for the following purposes:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>To keep you signed in</li>
              <li>To remember your preferences</li>
              <li>To understand how you use our website</li>
              <li>To improve our website's performance</li>
              <li>To provide personalized content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-medium mb-2">Essential Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.
            </p>

            <h3 className="text-xl font-medium mb-2">Analytics Cookies</h3>
            <p className="text-gray-600 mb-4">
              We use analytics cookies to help us understand how visitors interact with our website by collecting and reporting information anonymously.
            </p>

            <h3 className="text-xl font-medium mb-2">Functionality Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies enable enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.
            </p>

            <h3 className="text-xl font-medium mb-2">Marketing Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies track your online activity to help advertisers deliver more relevant advertising or to limit how many times you see an ad.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-600 mb-4">
              We use services from third parties that may also set cookies on your device. These include:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Google Analytics</li>
              <li>Social media platforms</li>
              <li>Payment processors</li>
              <li>Advertising networks</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Managing Cookies</h2>
            <p className="text-gray-600 mb-4">
              You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Browser-Specific Instructions</h2>
            <p className="text-gray-600 mb-4">To manage cookies in your browser:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Chrome: Settings → Privacy and security → Cookies and other site data</li>
              <li>Firefox: Options → Privacy & Security → Cookies and Site Data</li>
              <li>Safari: Preferences → Privacy → Cookies and website data</li>
              <li>Edge: Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update this Cookies Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about our use of cookies, please contact us at:
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

export default Cookies; 