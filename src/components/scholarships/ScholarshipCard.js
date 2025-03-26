import React from 'react';
import { Link } from 'react-router-dom';

const ScholarshipCard = ({ scholarship }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{scholarship.title}</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Eligibility</h3>
            <p className="text-gray-600">{scholarship.eligibility}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Benefits</h3>
            <ul className="list-disc list-inside text-gray-600">
              {scholarship.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Deadline</h3>
            <p className="text-gray-600">{new Date(scholarship.deadline).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Required Documents</h3>
            <ul className="list-disc list-inside text-gray-600">
              {scholarship.requiredDocuments.map((doc, index) => (
                <li key={index}>{doc}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6">
          <Link
            to={`/scholarships/${scholarship.id}/apply`}
            className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipCard; 