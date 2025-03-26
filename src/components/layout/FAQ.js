import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function FAQ() {
  const faqs = [
    {
      question: "What is the Intellectual Oasis Fellowship Scholarship Program?",
      answer: "The Intellectual Oasis Fellowship Scholarship Program is a transformative initiative that has supported over 300 students in their educational journey. We provide financial assistance to deserving students, helping them achieve their academic goals and contribute to society.",
      category: "Scholarships"
    },
    {
      question: "How can I apply for an IOF scholarship?",
      answer: "To apply for an IOF scholarship, visit our scholarship portal, create an account, and complete the application form. You'll need to provide academic records, personal information, and supporting documents. Our team carefully reviews each application to select the most deserving candidates.",
      category: "Scholarships"
    },
    {
      question: "How can I support the scholarship program?",
      answer: "You can support our scholarship program through donations. Your contribution helps us provide more opportunities to deserving students. We accept both one-time and recurring donations, and all contributions are used directly to fund student scholarships.",
      category: "Support"
    },
    {
      question: "What impact has the scholarship program made?",
      answer: "Since its inception, the Intellectual Oasis Fellowship has supported over 300 students through our scholarship program. These students have gone on to excel in their studies and make meaningful contributions to their communities. We're proud to be part of their educational journey.",
      category: "Impact"
    },
    {
      question: "What types of scholarships are available?",
      answer: "We offer various types of scholarships including merit-based awards, need-based assistance, and specialized program scholarships. Each scholarship is designed to support different aspects of education, from tuition fees to study materials and living expenses.",
      category: "Scholarships"
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...new Set(faqs.map(faq => faq.category))];

  const filteredFaqs = activeCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50" id="faq">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our platform and services
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-start sm:justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                activeCategory === category
                  ? 'bg-[rgb(130,88,18)] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
            >
              <button
                className="w-full px-4 sm:px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-300"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[rgb(130,88,18)]/10 flex items-center justify-center">
                    <span className="text-[rgb(130,88,18)] text-sm sm:text-base font-semibold">
                      {index + 1}
                    </span>
                  </span>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">{faq.question}</span>
                </div>
                <span className="ml-4 flex-shrink-0">
                  <motion.svg
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    className="w-5 h-5 sm:w-6 sm:h-6 text-[rgb(130,88,18)]"
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
                  </motion.svg>
                </span>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-100"
                  >
                    <div className="px-4 sm:px-6 py-4 bg-gray-50">
                      <div className="flex gap-2 items-center mb-2">
                        <span className="px-3 py-1 rounded-full bg-[rgb(130,88,18)]/10 text-[rgb(130,88,18)] text-xs font-medium">
                          {faq.category}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help!
          </p>
          <button className="inline-flex items-center gap-2 bg-[rgb(130,88,18)] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full hover:bg-[rgb(110,68,0)] transition-colors duration-300 text-sm sm:text-base">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
}

export default FAQ;