import React from 'react';
import SEO from '../seo/SEO';

function About() {
  const seoData = {
    title: "About IOF - Our Mission and Vision",
    description: "Learn about Intellectual Oasis Fellowship's mission to empower education through technology and innovation. Discover our history, values, and impact on education.",
    keywords: "about IOF, education mission, fellowship program, educational organization, IOF history",
    image: "/images/about-og.jpg"
  };

  return (
    <>
      <SEO {...seoData} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Intellectual Oasis Fellowship</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering education through technology and innovation. Join our community of learners and unlock your potential.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-600">
              To provide accessible, quality education through innovative technology and comprehensive support systems, enabling students to achieve their academic and professional goals.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
            <p className="text-gray-600">
              To be a leading force in educational innovation, creating opportunities for students worldwide to access quality education and develop skills for the future.
            </p>
          </div>
        </div>

        {/* History */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our History</h2>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <p className="text-gray-600 mb-4">
              Founded in 2020, Intellectual Oasis Fellowship emerged from a vision to transform education through technology and innovation. What started as a small initiative has grown into a comprehensive educational platform supporting thousands of students.
            </p>
            <p className="text-gray-600">
              Over the years, we've expanded our reach, developed new programs, and continuously improved our offerings to better serve our growing community of learners.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-3">Excellence</h3>
              <p className="text-gray-600">We strive for excellence in everything we do, from course content to student support.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-gray-600">We embrace new technologies and methods to enhance learning experiences.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-3">Accessibility</h3>
              <p className="text-gray-600">We believe education should be accessible to all, regardless of background or location.</p>
            </div>
          </div>
        </div>

        {/* Impact */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-4xl font-bold text-[rgb(130,88,18)] mb-2">300+</div>
              <p className="text-gray-600">Students Supported</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-4xl font-bold text-[rgb(130,88,18)] mb-2">50+</div>
              <p className="text-gray-600">Courses Offered</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-4xl font-bold text-[rgb(130,88,18)] mb-2">95%</div>
              <p className="text-gray-600">Success Rate</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default About; 