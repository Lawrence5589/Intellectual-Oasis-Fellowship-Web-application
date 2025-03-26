import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

const ScholarshipManagement = () => {
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: ''
  });

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
      ]
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
      ]
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
      ]
    }
  ];

  useEffect(() => {
    fetchScholarships();
    fetchApplications();
  }, []);

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
    }
  };

  const fetchApplications = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'scholarshipApplications'));
      const applicationData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(applicationData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateUpdate = async (scholarshipId) => {
    try {
      const docRef = doc(db, 'scholarships', scholarshipId);
      const scholarshipData = defaultScholarships.find(s => s.id === scholarshipId);
      
      // Create or update the document
      await setDoc(docRef, {
        ...scholarshipData,
        startDate: formData.startDate,
        endDate: formData.endDate,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      fetchScholarships();
      setFormData({ startDate: '', endDate: '' });
    } catch (error) {
      console.error('Error updating dates:', error);
    }
  };

  const handleApplicationStatusUpdate = async (applicationId, newStatus) => {
    try {
      const docRef = doc(db, 'scholarshipApplications', applicationId);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

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
      <h1 className="text-3xl font-bold mb-8">Scholarship Management</h1>
      
      {/* Scholarship List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {defaultScholarships.map(scholarship => {
          const scholarshipData = scholarships.find(s => s.id === scholarship.id) || {};
          const status = getScholarshipStatus(scholarshipData);
          
          return (
            <div key={scholarship.id} className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">{scholarship.title}</h2>
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  status === 'open' ? 'bg-green-100 text-green-800' :
                  status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => handleDateUpdate(scholarship.id)}
                  className="w-full bg-[rgb(130,88,18)] text-white py-2 px-4 rounded-md hover:bg-[rgb(110,75,15)] transition-colors duration-300"
                >
                  Update Dates
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Applications List */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Applications</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scholarship</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map(application => (
                <tr key={application.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{application.fullName}</div>
                    <div className="text-sm text-gray-500">{application.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {defaultScholarships.find(s => s.id === application.scholarshipId)?.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={application.status}
                      onChange={(e) => handleApplicationStatusUpdate(application.id, e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-[#2563eb] focus:ring-[#2563eb]"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipManagement; 