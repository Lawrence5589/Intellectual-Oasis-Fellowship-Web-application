import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

const ScholarshipPage = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'scholarships'));
        const scholarshipData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setScholarships(scholarshipData);
      } catch (error) {
        console.error('Error fetching scholarships:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, []);

  const defaultScholarships = [
    {
      id: 'fellow-scholarship',
      title: 'Become a Fellow Scholarship',
      type: 'fellow',
      eligibility: 'Nigerian University Students from 2nd level until penultimate year',
      benefits: [
        'Year tuition cost coverage',
        'Exam stipends',
        'Opportunity to become a mentor'
      ],
      requiredDocuments: [
        'Valid Student ID',
        'Academic Transcript',
        'Letter of Recommendation',
        'Statement of Purpose',
        'Passport Photograph'
      ],
      description: 'This scholarship is designed to support outstanding Nigerian university students who demonstrate academic excellence and leadership potential.'
    },
    {
      id: 'utme-scholarship',
      title: 'UTME Scholar Project',
      type: 'utme',
      eligibility: 'Students in Senior Secondary School',
      benefits: [
        'UTME fee coverage',
        'Post UTME fee coverage',
        'First year tuition fee coverage'
      ],
      requiredDocuments: [
        'WAEC/NECO Result',
        'School ID',
        'Letter of Recommendation',
        'Statement of Purpose',
        'Passport Photograph'
      ],
      description: 'This scholarship supports promising secondary school students in their journey to higher education by covering their examination and initial tuition fees.'
    },
    {
      id: 'orphan-scholarship',
      title: 'Orphan Project',
      type: 'orphan',
      eligibility: 'Orphaned children in Schools in need of financial Support',
      benefits: [
        'Tuition fee coverage',
        'Educational materials support',
        'Mentorship program access'
      ],
      requiredDocuments: [
        'Death Certificate(s) of Parent(s)',
        'Guardian\'s ID',
        'School ID',
        'Academic Records',
        'Letter of Recommendation',
        'Passport Photograph'
      ],
      description: 'This scholarship provides financial support and mentorship to orphaned children, helping them pursue their education without financial barriers.'
    }
  ];

  const getScholarshipStatus = (scholarship) => {
    const now = new Date();
    const startDate = new Date(scholarship.startDate);
    const endDate = new Date(scholarship.endDate);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'closed';
    return 'open';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Available Scholarships</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {defaultScholarships.map(scholarship => {
          const status = getScholarshipStatus(scholarship);
          const scholarshipData = scholarships.find(s => s.id === scholarship.id) || {};
          
          return (
            <div key={scholarship.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{scholarship.title}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    status === 'open' ? 'bg-[rgb(130,88,18)] text-white' :
                    status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
                
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

                  {scholarshipData.startDate && scholarshipData.endDate && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">Application Period</h3>
                      <p className="text-gray-600">
                        {new Date(scholarshipData.startDate).toLocaleDateString()} - 
                        {new Date(scholarshipData.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
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
                  {status === 'open' ? (
                    <Link
                      to={`/scholarships/${scholarship.id}/apply`}
                      className="block w-full text-center bg-[rgb(130,88,18)] text-white py-2 px-4 rounded-md hover:bg-[rgb(110,75,15)] transition-colors duration-300"
                    >
                      Apply Now
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="block w-full text-center bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed"
                    >
                      {status === 'upcoming' ? 'Coming Soon' : 'Application Closed'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScholarshipPage; 