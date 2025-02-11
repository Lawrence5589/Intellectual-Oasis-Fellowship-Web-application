import React from 'react';
import { Link } from 'react-router-dom';

function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Adamu Musa",
      role: "Medical Student",
      image: "/images/testimonials/student1.jpg",
      quote: "The scholarship resources and exam preparation materials helped me achieve my dream of getting into medical school.",
      rating: 5,
      location: "Lagos, Nigeria"
    },
    {
      id: 2,
      name: "Luke Skywalker",
      role: "Engineering Graduate",
      image: "/images/testimonials/student2.jpg",
      quote: "The platform's comprehensive study materials and practice tests were instrumental in my success.",
      rating: 5,
      location: "Accra, Ghana"
    },
    {
      id: 3,
      name: "James Bond",
      role: "Law Student",
      image: "/images/testimonials/student3.jpg",
      quote: "I couldn't have prepared for my LSAT as effectively without the resources provided here.",
      rating: 5,
      location: "Nairobi, Kenya"
    }
  ];

  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white" id="testimonials">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Student Success Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of students who have transformed their educational journey with our platform
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute left-0 top-0 -z-10">
          <div className="w-64 h-64 bg-yellow-100 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group bg-white rounded-2xl shadow-xl p-8 relative transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 right-8">
                <div className="bg-[rgb(130,88,18)] rounded-full p-3 text-white shadow-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 10.5h-.5a2.5 2.5 0 1 1 2.5-2.5v.5m8 4h-.5a2.5 2.5 0 1 1 2.5-2.5v.5"
                    />
                  </svg>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <StarRating rating={testimonial.rating} />
              </div>

              {/* Quote */}
              <div className="text-gray-700 mb-6 font-medium italic">
                "{testimonial.quote}"
              </div>

              {/* Author */}
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center border-2 border-[rgb(130,88,18)]">
                    {/* User Profile Icon SVG */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-8 h-8 text-gray-700"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-[rgb(130,88,18)] text-sm font-medium">
                    {testimonial.role}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">Ready to start your journey?</p>
          <Link
              to="/signup"
              className="group relative px-8 py-4 rounded-full bg-[rgb(130,88,18)] text-white overflow-hidden transition-all duration-300 hover:bg-[rgb(110,68,0)]"
            >
              <span className="relative z-10 text-lg font-medium">Join our Community now</span>
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;