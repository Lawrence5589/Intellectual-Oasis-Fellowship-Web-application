import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  const slides = [
    'images/bg1.png',
    'images/bg2.png',
    'images/bg3.png',
    'images/bg4.png',
    'images/bg5.png',
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <header className="relative overflow-hidden">
      <div className="hero-slideshow absolute inset-0 w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide absolute w-full h-full bg-center bg-cover transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${slide})` }}
          />
        ))}
      </div>
      <div className="container mx-auto text-center relative z-10 py-16 mt-16 p-4 bg-black bg-opacity-50">
        <h1 className="text-5xl font-extrabold text-white mb-4">Empower Your Learning Journey</h1>
        <p className="text-xl text-gray-200 mb-6">Join thousands of learners and access courses for free, sponsored by Intellectual Oasis Fellowship.</p>
        <Link to="/signup" className="mt-6 bg-iof-dark text-white px-8 py-3 rounded-full inline-block hover:bg-iof transition-colors duration-300 shadow-lg">Join Now</Link>

      </div>
    </header>
  );
}

export default Hero;