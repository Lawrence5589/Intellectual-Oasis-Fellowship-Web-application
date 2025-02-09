import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import About from './About';
import Courses from './CoursesTray';
import Testimonials from './Testimonials';
import Contact from './Contact';
import Footer from './Footer';

function LandingPage() {
  return (
    <>
      <Hero />
      <About />
      <Courses />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  );
}

export default LandingPage;