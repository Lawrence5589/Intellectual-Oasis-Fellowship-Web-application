import React from 'react';
import { Link } from 'react-router-dom';

function Courses() {
  const courses = [
    {
      title: "Understanding the Role of SMEs",
      content: "Core responsibilities and expectations of Subject Matter Experts.",
      image: "images/rcourses.png",
      rating: "5.0 ★",
      duration: "2 Hours",
    },
    {
      title: "Content Development Fundamentals",
      content: "Creating effective learning materials and resources.",
      image: "images/rcourses.png",
      rating: "4.8 ★",
      duration: "3 Hours",
    },
    {
      title: "Assessment Design Principles",
      content: "Creating effective evaluations and assessments.",
      image: "images/rcourses.png",
      rating: "4.9 ★",
      duration: "2.5 Hours",
    },
    {
      title: "Digital Tools for SMEs",
      content: "Leveraging technology for content creation and delivery.",
      image: "images/rcourses.png",
      rating: "4.7 ★",
      duration: "3 Hours",
    },
    {
      title: "Instructional Design Basics",
      content: "Understanding learning theories and instructional strategies.",
      image: "images/rcourses.png",
      rating: "4.6 ★",
      duration: "4 Hours",
    },
    {
      title: "Collaborative Development",
      content: "Working effectively with instructional designers and stakeholders.",
      image: "images/rcourses.png",
      rating: "4.9 ★",
      duration: "2.5 Hours",
    },
    {
      title: "Quality Assurance in Content",
      content: "Ensuring high standards in educational materials.",
      image: "images/rcourses.png",
      rating: "4.8 ★",
      duration: "3 Hours",
    },
    {
      title: "Feedback and Iteration",
      content: "Implementing feedback and improving content quality.",
      image: "images/rcourses.png",
      rating: "4.7 ★",
      duration: "2 Hours",
    },
    {
      title: "SME Best Practices",
      content: "Industry standards and proven methodologies.",
      image: "images/rcourses.png",
      rating: "5.0 ★",
      duration: "3.5 Hours",
    },
  ];

  return (
    <section id="courses" className="py-16 p-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-iof mb-8 text-center">Discover Popular Learning Paths</h2>
        <div className="overflow-x-hidden custom-scrollbar flex space-x-4 pb-2">
          {courses.map((course, index) => (
            <div key={index} className="flex-none w-60 rounded-lg bg-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-300">
              <div className="relative">
                <img src={course.image} alt={course.title} className="w-full h-32 object-cover rounded-t-lg" />
                <div className="absolute top-2 right-2 bg-white text-black px-3 py-1 rounded-full text-sm font-semibold">{course.rating}</div>
              </div>
              <div className="p-4 flex flex-col justify-between">
                <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-2">{course.content}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">{course.duration}</span>
                  <Link to="/courses" className="text-iof hover:text-iof-dark font-semibold">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Courses;