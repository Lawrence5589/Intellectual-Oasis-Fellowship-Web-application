import React, { useState } from 'react';
import SEO from '../seo/SEO';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

function Donate() {
  const seoData = {
    title: "Donate to IOF - Support Education",
    description: "Make a difference in students' lives by donating to IOF. Your contribution helps provide educational opportunities and scholarships to deserving students.",
    keywords: "donate, education funding, scholarship support, IOF donations, education charity",
    image: "/images/donate-og.jpg"
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
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
      await addDoc(collection(db, 'donations'), {
        ...formData,
        timestamp: serverTimestamp(),
        status: 'pending'
      });

      setStatus({ loading: false, success: true, error: null });
      setFormData({
        name: '',
        email: '',
        phone: '',
        amount: '',
        message: '',
        consent: false
      });
    } catch (error) {
      setStatus({ loading: false, success: false, error: 'Failed to submit donation. Please try again.' });
    }
  };

  return (
    <>
      <SEO {...seoData} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Education Through Donation</h1>
          <p className="text-xl text-gray-600">Your contribution helps us provide educational opportunities to deserving students.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Donation Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Make a Donation</h2>
            {status.success && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
                Thank you for your interest in donating! We will contact you shortly to process your payment.
              </div>
            )}
            {status.error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                {status.error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (NGN)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  required
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message (Optional)</label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]"
                  placeholder="Enter your message"
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  required
                  className="h-4 w-4 text-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)] border-gray-300 rounded"
                  checked={formData.consent}
                  onChange={handleChange}
                />
                <label htmlFor="consent" className="ml-2 block text-sm text-gray-700">
                  I agree to be contacted about my donation and consent to the processing of my personal data
                </label>
              </div>
              <button
                type="submit"
                disabled={status.loading}
                className={`w-full bg-[rgb(130,88,18)] text-white py-3 px-6 rounded-md hover:bg-[rgb(110,68,0)] transition-colors duration-300 ${
                  status.loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {status.loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </form>
          </div>

          {/* Donation Information */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Why Donate?</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Support Education</h3>
                <p className="text-gray-600">Your donation helps provide educational opportunities to deserving students who might not otherwise have access to quality education.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Make a Difference</h3>
                <p className="text-gray-600">Every contribution, no matter the size, helps us create a better future for students and their communities.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tax Benefits</h3>
                <p className="text-gray-600">Donations to IOF are tax-deductible, allowing you to support education while receiving tax benefits.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Transparency</h3>
                <p className="text-gray-600">We maintain complete transparency in how donations are used and provide regular updates on the impact of your contribution.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Donate; 