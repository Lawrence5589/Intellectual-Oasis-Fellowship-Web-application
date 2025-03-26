import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const MyApplications = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (!currentUser) {
          navigate('/login');
          return;
        }

        const applicationsRef = collection(db, 'users', currentUser.uid, 'applications');
        const querySnapshot = await getDocs(applicationsRef);
        
        const apps = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort by most recent first
        apps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        setApplications(apps);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [currentUser, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseDisplay = (phase) => {
    switch (phase) {
      case 'document_review':
        return 'Document Review';
      case 'quiz':
        return 'Quiz Phase';
      case 'completed':
        return 'Completed';
      default:
        return phase;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(130,88,18)]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Scholarship Applications</h1>

      {applications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">You haven't applied for any scholarships yet.</p>
          <Link
            to="/scholarships"
            className="inline-block bg-[rgb(130,88,18)] text-white py-2 px-4 rounded-md hover:bg-[rgb(110,75,15)] transition-colors duration-300"
          >
            View Available Scholarships
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <div
              key={application.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {application.scholarshipTitle}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Applied on {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-600">
                    Phase: {getPhaseDisplay(application.phase)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Application Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Institution</p>
                    <p className="font-medium">{application.institution}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium">{application.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Level</p>
                    <p className="font-medium">{application.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CGPA</p>
                    <p className="font-medium">{application.cgpa}</p>
                  </div>
                </div>
              </div>

              {application.phase === 'quiz' && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Quiz Phase</h3>
                      <p className="text-sm text-gray-600">
                        Your application has been approved for the quiz phase.
                      </p>
                    </div>
                    <Link
                      to={`/scholarships/quiz/${application.id}`}
                      className="bg-[rgb(130,88,18)] text-white py-2 px-4 rounded-md hover:bg-[rgb(110,75,15)] transition-colors duration-300"
                    >
                      Take Quiz
                    </Link>
                  </div>
                </div>
              )}

              {application.quizScore !== null && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz Results</h3>
                  <p className="text-sm text-gray-600">
                    Score: <span className="font-medium">{application.quizScore}%</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Completed on:{' '}
                    <span className="font-medium">
                      {new Date(application.quizCompletedAt).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications; 