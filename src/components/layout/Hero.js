import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function Hero() {
  const slides = [
    {
      image: 'images/landingbg1.webp',
      title: 'Empower Your Learning Journey',
      subtitle: 'Access World-Class Education',
      description: 'Join thousands of learners and access courses for free, sponsored by Intellectual Oasis Fellowship.'
    },
    {
      image: 'images/landingbg2.webp',
      title: 'Learn Without Limits',
      subtitle: 'Flexible Online Learning',
      description: 'Study at your own pace with our comprehensive online learning platform.'
    },
    {
      image: 'images/landingbg3.webp',
      title: 'Shape Your Future',
      subtitle: 'Career-Focused Education',
      description: 'Get the skills you need to succeed in todays competitive job market.'
    },
    {
      image: 'images/landingbg4.webp',
      title: 'Curate your own Quizzes',
      subtitle: 'Learn through quizzes',
      description: 'Create your own quizzez from our massive library of questions.'
    },
    {
      image: 'images/landingbg5.webp',
      title: 'Become a Fellow',
      subtitle: 'Apply for a scholarship',
      description: 'Gain access to the fellowship and become a recipient of the scholarship.'
    }
    
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isAnimating, slides.length]);

  const handleSlideClick = (index) => {
    if (!isAnimating) {
      setCurrentSlide(index);
    }
  };

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <header className="relative h-screen overflow-hidden bg-black">
      {/* Background Slides */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            onAnimationStart={() => setIsAnimating(true)}
            onAnimationComplete={() => setIsAnimating(false)}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-center bg-cover transform scale-105 transition-transform duration-[2000ms]"
              style={{ 
                backgroundImage: `url(${slides[currentSlide].image})`,
                willChange: 'transform'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h3 className="text-xl md:text-2xl text-[rgb(130,88,18)] font-semibold mb-4">
                {slides[currentSlide].subtitle}
              </h3>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          >
            <Link
              to="/signup"
              className="group relative px-8 py-4 bg-[rgb(130,88,18)] text-white rounded-full overflow-hidden transition-all duration-300 hover:bg-[rgb(110,68,0)]"
            >
              <span className="relative z-10 text-lg font-medium">Get Started Now</span>
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
            
            <Link
              to="/courses"
              className="group px-8 py-4 border-2 border-white text-white rounded-full text-lg font-medium hover:bg-white hover:text-[rgb(130,88,18)] transition-all duration-300"
            >
              Explore Courses
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {[
              { number: '10K+', label: 'Active Students' },
              { number: '500+', label: 'Courses' },
              { number: '95%', label: 'Success Rate' },
              { number: '50+', label: 'Countries' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-300 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Slide Navigation */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideClick(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          onClick={handleScrollDown}
        >
          <div className="flex flex-col items-center text-white/80 hover:text-white transition-colors">
            <span className="text-[rgb(130,88,18)] font-medium mb-2">SCROLL DOWN</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

export default Hero;