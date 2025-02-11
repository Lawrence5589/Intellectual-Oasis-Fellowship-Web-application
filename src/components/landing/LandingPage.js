import React from 'react';
import Hero from '../layout/Hero';
import About from '../layout/About';
import Testimonials from '../layout/Testimonials';
import FAQ from '../layout/FAQ';
import Contact from '../layout/Contact';

function LandingPage() {
  return (
    <div className="max-w-[100vw] overflow-x-hidden">
      <main className="relative">
        <Hero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <About />
          <Testimonials />
          <FAQ />
          <Contact />
        </div>
      </main>
    </div>
  );
}

export default LandingPage;