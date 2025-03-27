import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function Contact() {
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(formRef.current);
      const submissionData = {
        name: formData.get('from_name'),
        email: formData.get('from_email'),
        message: formData.get('message'),
        timestamp: new Date(),
        status: 'pending',
        type: 'general' // You can add a type field in the form if needed
      };

      await addDoc(collection(db, 'contactSubmissions'), submissionData);

      setFormStatus({
        type: 'success',
        message: 'Thank you! Your message has been sent successfully.'
      });
      // Clear form
      formRef.current.reset();
    } catch (error) {
      console.error('Submission error:', error);
      setFormStatus({
        type: 'error',
        message: 'Sorry, there was an error sending your message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Our Location',
      content: 'Lagos, Nigeria',
      link: 'https://maps.google.com'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email Us',
      content: 'support@iofellowship.org',
      link: 'mailto:support@iofellowship.org'
    },
  ];

  const socialLinks = [
    {
      name: 'facebook',
      url: 'https://www.facebook.com/people/Intellectual-Oasis-Fellowship/61561270017439/',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.192 5 15.115 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z"/>
        </svg>
      )
    },
    {
      name: 'instagram',
      url: 'https://www.instagram.com/io_fellowship/',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      )
    },
    {
      name: 'linkedin',
      url: 'https://www.linkedin.com/company/intellectual-oasis-fellowship',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Get in Touch
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </motion.p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-8 mb-16">
          {contactInfo.map((info, index) => (
            <motion.a
              key={index}
              href={info.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[rgb(130,88,18)]/10 text-[rgb(130,88,18)] group-hover:bg-[rgb(130,88,18)] group-hover:text-white transition-colors duration-300">
                  {info.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                  <p className="text-gray-600">{info.content}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="p-6 sm:p-8 lg:p-12 bg-[rgb(130,88,18)]">
              <h3 className="text-2xl font-bold text-white mb-6">Let's talk about everything!</h3>
              <div className="space-y-4 text-white/80">
                <p>We're here to answer any questions you might have about our programs.</p>
                <p>Feel free to reach out using the contact form or through our social media channels.</p>
              </div>
              
              <div className="mt-8 space-y-4">
                <h4 className="font-semibold text-white">Follow us</h4>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                      aria-label={`Follow us on ${social.name}`}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-12">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="from_name"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent transition-all duration-300"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="from_email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent transition-all duration-300"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent transition-all duration-300"
                    placeholder="Your message here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[rgb(130,88,18)] text-white py-3 px-6 rounded-lg hover:bg-[rgb(110,68,0)] transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>

                {formStatus.message && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    formStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {formStatus.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;