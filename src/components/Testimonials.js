import React from 'react';

function Testimonials() {
  const testimonials = [
    {
      name: "Segun Martins",
      quote: "This platform has transformed my career. The courses are thorough and well-structured!",
      rating: "5.0 ★",
      image: "images/usericon.png",
    },
    {
      name: "Musa Ifeanyi",
      quote: "The support from instructors was amazing and made the learning process enjoyable.",
      rating: "4.8 ★",
      image: "images/usericon2.png",
    },
    {
      name: "Amina Popoola",
      quote: "A fantastic resource for online learning. Highly recommend!",
      rating: "4.9 ★",
      image: "images/usericon3.png",
    },
  ];

  return (
    <section id="testimonials" className="py-16 bg-cover bg-center" style={{ backgroundImage: 'url(images/bg1.png)' }}>
      <div className="container mx-auto text-center relative">
        <h2 className="text-3xl font-bold text-white mb-8">What Our Learners Say</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white w-full sm:w-auto max-w-xs rounded-lg shadow-lg p-6 flex flex-col items-center">
              <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full mb-4" />
              <div className="flex items-center mb-2">
                <span className="text-lg font-semibold text-iof-dark">{testimonial.rating}</span>
              </div>
              <blockquote className="text-gray-600 italic mb-2">{testimonial.quote}</blockquote>
              <cite className="text-iof-dark">- {testimonial.name}</cite>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;