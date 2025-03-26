import React from 'react';
import SEO from '../seo/SEO';
import Hero from '../layout/Hero';
import About from '../layout/About';
import Testimonials from '../layout/Testimonials';
import FAQ from '../layout/FAQ';
import Contact from '../layout/Contact';

function LandingPage() {
  const seoData = {
    title: "Intellectual Oasis Fellowship - Empowering Education Through Scholarships",
    description: "Join IOF in transforming education. We've supported over 300 students through our scholarship program. Make a difference by donating to help more students achieve their academic dreams.",
    keywords: "scholarship program, education funding, student support, academic fellowship, education donations, Nigeria education, student scholarships, IOF scholarships",
    image: "/images/og-image.jpg" // Add your OG image
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Intellectual Oasis Fellowship",
    "description": seoData.description,
    "url": "https://iofellowship.org",
    "logo": "https://iofellowship.org/logo.png",
    "sameAs": [
      "https://www.facebook.com/people/Intellectual-Oasis-Fellowship/61561270017439/",
      "https://www.instagram.com/io_fellowship/",
      "https://www.linkedin.com/company/intellectual-oasis-fellowship"
    ],
    "offers": {
      "@type": "Offer",
      "category": "Educational Scholarship",
      "description": "Scholarship program supporting over 300 students in their educational journey",
      "numberOfItems": "300+"
    },
    "foundingDate": "2020",
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "value": "300+",
      "unitText": "Students Supported"
    }
  };

  return (
    <>
      <SEO {...seoData} />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <div className="max-w-[100vw] overflow-x-hidden">
        <main className="relative">
          <Hero />
          <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <About />
            <Testimonials />
            <FAQ />
            <Contact />
          </article>
        </main>
      </div>
    </>
  );
}

export default LandingPage;