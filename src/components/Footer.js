import React from 'react';

function Footer() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-iof text-white py-8 relative">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center p-4">
        <p className="text-sm mb-4 md:mb-0">&copy; 2024 Intellectual Oasis Fellowship. All Rights Reserved.</p>
        <div className="flex space-x-4 mb-4 md:mb-0 p-4">
          <a href="#" className="hover:text-gray-300 transition-colors duration-200">Facebook</a>
          <a href="#" className="hover:text-gray-300 transition-colors duration-200">Twitter</a>
          <a href="#" className="hover:text-gray-300 transition-colors duration-200">LinkedIn</a>
        </div>
      </div>
      <button 
        onClick={handleScrollToTop} 
        className="fixed right-6 bottom-10 bg-iof hover:bg-iof text-white p-3 rounded-full shadow-lg transition-transform duration-300 transform hover:scale-150"
        aria-label="Scroll to top"
      >
        &#8679;
      </button>
    </footer>
  );
}

export default Footer;