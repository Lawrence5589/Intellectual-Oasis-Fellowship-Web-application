import React, { useState } from 'react';

function About() {
  const slides = [
    {
      title: "Empowering Nigerian Students",
      content: "We offer comprehensive scholarship programs to Nigerian students at the tertiary level, empowering them to achieve their academic goals without financial burdens.",
      image: "images/about1.png",
    },
    {
      title: "Free Certification Courses",
      content: "Access a wide range of professionally curated certification courses at no cost. Enhance your skills and knowledge with our expertly designed learning paths.",
      image: "images/about2.png",
    },
    {
      title: "The Oasis Quiz Repository",
      content: "Explore Nigeria's largest quiz repository, the Oasis. Engage, learn, and test your knowledge through interactive quizzes personally curated by experts.",
      image: "images/about3.png",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section id="about" className="py-16 bg-gray-50">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold text-iof mb-12">About Intellectual Oasis Fellowship</h2>
        <div id="about-slides" className="relative overflow-hidden shadow-md flex">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`about-slide bg-white shadow-lg rounded-lg p-8 flex-shrink-0 w-full transition-opacity duration-500 ease-in-out ${
                index === currentSlide ? '' : 'opacity-0 absolute'
              }`}
            >
              <h3 className="text-2xl font-bold text-iof mb-4">{slide.title}</h3>
              <p className="text-gray-600 mb-4">{slide.content}</p>
              <span 
                className="block w-full h-80 bg-cover bg-center rounded"
                style={{ backgroundImage: `url(${slide.image})` }}
              ></span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-6">
          <button onClick={prevSlide} className="nav-arrow mr-2">
            &#8249;
          </button>
          <button onClick={nextSlide} className="nav-arrow ml-2">
            &#8250;
          </button>
        </div>
      </div>
    </section>
  );
}

export default About;