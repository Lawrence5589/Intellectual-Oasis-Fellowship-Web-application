import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ApplicationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { scholarshipTitle, applicationId } = location.state || {};

  useEffect(() => {
    // If no state is present, redirect to scholarships page
    if (!scholarshipTitle) {
      navigate('/scholarships');
    }
  }, [scholarshipTitle, navigate]);

  if (!scholarshipTitle) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Application Submitted Successfully!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for applying for the {scholarshipTitle}. We will review your application and get back to you soon.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Application ID: {applicationId}
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Link
            to="/scholarships/my-applications"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[rgb(130,88,18)] hover:bg-[rgb(110,75,15)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(130,88,18)]"
          >
            View My Applications
          </Link>
          <Link
            to="/scholarships"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(130,88,18)]"
          >
            View Other Scholarships
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccess; 