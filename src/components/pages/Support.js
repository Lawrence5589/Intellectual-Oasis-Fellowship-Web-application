import React, { useState } from 'react';
import SEO from '../seo/SEO';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

function Support() {
  const seoData = {
    title: "Support - Get Help from IOF",
    description: "Need help? Contact our support team for assistance with your courses, scholarships, or any other inquiries. We're here to help you succeed.",
    keywords: "support, contact, help, IOF support, customer service",
    image: "/images/support-og.jpg"
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'general',
    subject: '',
    message: '',
    consent: false
  });

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    try {
      await addDoc(collection(db, 'contactSubmissions'), {
        ...formData,
        timestamp: serverTimestamp(),
        status: 'pending'
      });

      setStatus({ loading: false, success: true, error: null });
      setFormData({
        name: '',
        email: '',
        phone: '',
        type: 'general',
        subject: '',
        message: '',
        consent: false
      });
    } catch (error) {
      setStatus({ loading: false, success: false, error: error.message });
    }
  };

  return (
    <>
      <SEO {...seoData} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Center</h1>
          <p className="text-xl text-gray-600">We're here to help you succeed. Get in touch with our support team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-600">support@iofellowship.org</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Response Time</h3>
                <p className="text-gray-600">We typically respond within 24-48 hours.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Office Hours</h3>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM (WAT)</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Social Media</h3>
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com/profile.php?id=61561270017439" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[rgb(130,88,18)]">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/io_fellowship/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[rgb(130,88,18)]">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                    </svg>
                  </a>
                  <a href="https://www.linkedin.com/company/intellectual-oasis-fellowship" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[rgb(130,88,18)]">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Support Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
            {status.success && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
                Thank you for your message. We'll get back to you soon!
              </div>
            )}
            {status.error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                Error: {status.error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]"
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type of Inquiry</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]"
                  required
                >
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing Issue</option>
                  <option value="course">Course Related</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="donation">Donation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]"
                  required
                ></textarea>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="consent"
                    name="consent"
                    type="checkbox"
                    checked={formData.consent}
                    onChange={handleChange}
                    className="focus:ring-[rgb(130,88,18)] h-4 w-4 text-[rgb(130,88,18)] border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="consent" className="font-medium text-gray-700">
                    I agree to be contacted by IOF
                  </label>
                  <p className="text-gray-500">
                    By checking this box, you consent to receive communications from IOF regarding your inquiry.
                  </p>
                </div>
              </div>
              <button
                type="submit"
                disabled={status.loading}
                className="w-full bg-[rgb(130,88,18)] text-white py-3 px-6 rounded-md hover:bg-[rgb(110,68,0)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status.loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Support; 