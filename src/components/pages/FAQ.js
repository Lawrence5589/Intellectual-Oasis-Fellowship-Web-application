import React, { useState } from 'react';
import SEO from '../seo/SEO';

function FAQ() {
  const seoData = {
    title: "FAQ - Frequently Asked Questions",
    description: "Find answers to common questions about IOF's programs, courses, scholarships, and more. Get the information you need to make informed decisions about your education.",
    keywords: "FAQ, frequently asked questions, IOF programs, education questions, scholarship FAQ",
    image: "/images/faq-og.jpg"
  };

  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is Intellectual Oasis Fellowship?",
      answer: "Intellectual Oasis Fellowship (IOF) is an educational organization dedicated to providing accessible, quality education through innovative technology and comprehensive support systems. We offer various programs, courses, and scholarships to help students achieve their academic and professional goals."
    },
    {
      question: "How do I apply for a scholarship?",
      answer: "To apply for a scholarship, visit our scholarships page and complete the application form. You'll need to provide your academic records, personal information, and any required documentation. The selection process is based on academic merit, financial need, and other criteria specific to each scholarship program."
    },
    {
      question: "What courses do you offer?",
      answer: "We offer a wide range of courses across various disciplines, including technology, business, arts, and sciences. Our courses are designed to be flexible and accessible, with both online and hybrid learning options available. Visit our courses page to explore our current offerings."
    },
    {
      question: "How do I verify my certificate?",
      answer: "You can verify your certificate by visiting our certificate verification page and entering your certificate ID. This will allow you to confirm the authenticity of your certificate and view its details."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including credit/debit cards, bank transfers, and other local payment options. All payments are processed securely through our payment partners."
    },
    {
      question: "How can I contact support?",
      answer: "You can contact our support team through multiple channels: email support@iofellowship.org, our support portal, or by using the contact form on our website. Our team typically responds within 24-48 hours."
    },
    {
      question: "Are your courses accredited?",
      answer: "Yes, our courses are accredited and recognized by relevant educational authorities. We maintain high academic standards and regularly update our curriculum to meet industry requirements."
    },
    {
      question: "What is your refund policy?",
      answer: "We offer a refund policy for course fees within 14 days of purchase if you're not satisfied with the course. Scholarship funds are non-refundable. Please refer to our terms of service for detailed information."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <SEO {...seoData} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">Find answers to common questions about our programs and services.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4">
              <button
                className="w-full text-left bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <svg
                    className={`w-6 h-6 transform transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              {openIndex === index && (
                <div className="mt-2 p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="/support"
            className="inline-block bg-[rgb(130,88,18)] text-white px-6 py-3 rounded-md hover:bg-[rgb(110,68,0)] transition-colors duration-300"
          >
            Contact Support
          </a>
        </div>
      </div>
    </>
  );
}

export default FAQ; 