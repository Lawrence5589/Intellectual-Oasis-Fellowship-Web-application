import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import UserProfileIcon from '../auth/UserProfileIcon';

function Navbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      if (isLandingPage) {
        // On landing page, show navbar after scrolling past hero section
        setIsScrolled(scrollPosition > window.innerHeight * 0.8);
      } else {
        // On other pages, add background when scrolled slightly
        setIsScrolled(scrollPosition > 20);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLandingPage]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Hide navbar on landing page until scrolled
  if (isLandingPage && !isScrolled) return null;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/images/Group 4.jpg" 
              className="h-12 w-auto" 
              alt="IOF Logo" 
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/courses"
              className="text-gray-700 hover:text-[rgb(130,88,18)] transition-colors duration-300"
            >
              Courses
            </Link>
            <Link
              to="/scholarships"
              className="text-gray-700 hover:text-[rgb(130,88,18)] transition-colors duration-300"
            >
              Scholarships
            </Link>
            <Link
              to="/blog"
              className="text-gray-700 hover:text-[rgb(130,88,18)] transition-colors duration-300"
            >
              Blog
            </Link>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <UserProfileIcon />
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-[rgb(130,88,18)] transition-colors duration-300"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-[rgb(130,88,18)] text-white px-6 py-2 rounded-full hover:bg-[rgb(110,68,0)] transition-colors duration-300"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {user && <UserProfileIcon />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {!isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex flex-col space-y-3">
                {!user && (
                  <div className="pt-4 space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-4 py-2 text-center text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-4 py-2 text-center text-white bg-[rgb(130,88,18)] hover:bg-[rgb(110,68,0)] rounded-lg"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;