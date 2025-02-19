import React from 'react';
import { Helmet } from 'react-helmet-async';

function SEO({ title, description, keywords, image }) {
  const siteUrl = "https://iofellowship.org"; // Your actual domain

  // Default values related to Intellectual Oasis Fellowship
  const defaultTitle = "Intellectual Oasis Fellowship | Scholarships, Quizzes, and Courses";
  const defaultDescription = "Intellectual Oasis Fellowship (IOF) offers scholarships, one of Africa's largest quiz repositories, and a course management platform to earn certifications.";
  const defaultKeywords = "Intellectual Oasis Fellowship, IOF, scholarships, African quiz repository, course management, academic fellowship, certifications";
  const defaultImage = `${siteUrl}/path-to-default-image.jpg`; // Replace with your default image path

  const facebookPageUrl = "https://www.facebook.com/profile.php?id=61561270017439";
  const instagramProfileUrl = "https://www.instagram.com/io_fellowship/";
  const linkedinPageUrl = "https://www.linkedin.com/company/intellectual-oasis-fellowship";

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />

      {/* Links to social media profiles */}
      <link rel="me" href={facebookPageUrl} />
      <link rel="me" href={instagramProfileUrl} />
      <link rel="me" href={linkedinPageUrl} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={siteUrl} />
      <meta property="twitter:title" content={title || defaultTitle} />
      <meta property="twitter:description" content={description || defaultDescription} />
      <meta property="twitter:image" content={image || defaultImage} />

      {/* Additional SEO tags */}
      <link rel="canonical" href={siteUrl} />
      <meta name="robots" content="index, follow" />
    </Helmet>
  );
}

export default SEO;