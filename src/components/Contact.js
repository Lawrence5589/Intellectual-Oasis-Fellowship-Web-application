import React from 'react';

function Contact() {
  return (
    <section id="contact" className="py-16 bg-gray-100">
      <div className="container mx-auto px-4 flex flex-wrap justify-center">
        <div className="w-full lg:w-1/2 mb-8 lg:mb-0 lg:pr-8 text-center lg:text-left">
          <h2 className="text-3xl font-bold text-iof mb-4">Get in Touch</h2>
          <p className="text-lg text-gray-700 mb-6">We'd love to hear from you! Please fill out the form or reach us at:</p>
          <div className="mb-2">
            <i className="fas fa-map-marker-alt text-iof"></i>
            <span className="ml-2 text-gray-600">Our Location: Lagos, Nigeria</span>
          </div>
          <div>
            <i className="fas fa-envelope text-iof"></i>
            <span className="ml-2 text-gray-600">Email: iofscholarships@gmail.com</span>
          </div>
        </div>
        <div className="w-full lg:w-1/2">
          <form id="contactForm" className="bg-white shadow-lg rounded-lg p-8">
            <input type="text" name="name" placeholder="Your Name" className="w-full mb-4 p-3 border rounded" required />
            <input type="email" name="email" placeholder="Your Email" className="w-full mb-4 p-3 border rounded" required />
            <textarea name="message" placeholder="Your Message" className="w-full mb-4 p-3 border rounded" required></textarea>
            <button type="submit" className="bg-iof text-white px-4 py-2 rounded hover:bg-iof-dark">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;