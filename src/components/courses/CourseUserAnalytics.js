import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from '../common/LoadingIndicator';

function CourseUserAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const certificatesPerPage = 3; // Number of certificates per page
  const [analytics, setAnalytics] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    completionRate: 0,
    certificates: [],
    preferredCategories: {},
  });

  // Calculate pagination values
  const indexOfLastCertificate = currentPage * certificatesPerPage;
  const indexOfFirstCertificate = indexOfLastCertificate - certificatesPerPage;
  const currentCertificates = analytics.certificates.slice(
    indexOfFirstCertificate,
    indexOfLastCertificate
  );
  const totalPages = Math.ceil(analytics.certificates.length / certificatesPerPage);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) {
        console.log('No user found');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching analytics for user:', user.uid);
        
        // Get user's course progress
        const progressRef = collection(db, 'users', user.uid, 'courseProgress');
        const progressSnapshot = await getDocs(progressRef);
        console.log('Progress snapshot:', progressSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
        
        // Get completed courses data
        const completedRef = collection(db, 'users', user.uid, 'completedSubCourses');
        const completedSnapshot = await getDocs(completedRef);
        console.log('Completed courses snapshot:', completedSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
        
        let totalCourses = 0;
        let completedCourses = 0;
        let inProgressCourses = 0;
        let certificates = [];
        let categories = {};

        // Process each enrolled course
        await Promise.all(
          progressSnapshot.docs.map(async (progressDoc) => {
            const progressData = progressDoc.data();
            const courseId = progressDoc.id;
            console.log('Processing course:', courseId, progressData);

            // Fetch the course details
            const courseDoc = await getDoc(doc(db, 'courses', courseId));
            if (!courseDoc.exists()) {
              console.log('Course document not found:', courseId);
              return;
            }

            const courseData = courseDoc.data();
            console.log('Course data:', courseData);
            totalCourses++;

            // Update category count
            if (courseData.category) {
              categories[courseData.category] = (categories[courseData.category] || 0) + 1;
            }

            // Check completion status
            if (progressData.progress === 100) {
              console.log('Course completed:', courseId);
              completedCourses++;
              
              // Check for certificate in completedSubCourses
              const completedDoc = completedSnapshot.docs.find(doc => doc.id === courseId);
              console.log('Completed doc found:', completedDoc?.data());
              
              if (completedDoc) {
                const completedData = completedDoc.data();
                
                // Also check certificates collection
                const certificateRef = doc(db, 'certificates', completedData.verificationId || 'none');
                const certificateDoc = await getDoc(certificateRef);
                console.log('Certificate doc:', certificateDoc?.data());

                if (completedData.verificationId && certificateDoc.exists()) {
                  certificates.push({
                    id: courseId,
                    title: courseData.title,
                    completedAt: completedData.firstCompletedAt || completedData.completedAt,
                    verificationId: completedData.verificationId,
                    category: courseData.category || 'General'
                  });
                  console.log('Certificate added:', certificates[certificates.length - 1]);
                }
              }
            } else if (progressData.progress > 0) {
              console.log('Course in progress:', courseId);
              inProgressCourses++;
            }
          })
        );

        // Sort certificates by completion date (newest first)
        certificates.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        console.log('Final certificates array:', certificates);

        // Calculate completion rate
        const completionRate = totalCourses > 0 
          ? ((completedCourses / totalCourses) * 100).toFixed(1) 
          : 0;

        const analyticsData = {
          totalCourses,
          completedCourses,
          inProgressCourses,
          completionRate,
          certificates,
          preferredCategories: categories,
        };
        
        console.log('Setting analytics data:', analyticsData);
        setAnalytics(analyticsData);

      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  // Add console log to check analytics state
  useEffect(() => {
    console.log('Current analytics state:', analytics);
  }, [analytics]);

  const handleCertificateClick = (courseId) => {
    navigate(`/courses/${courseId}/certificate`);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-iof mb-4 sm:mb-6">Learning Progress</h2>
      
      {/* Progress Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">Enrolled Courses</h3>
          <p className="text-lg sm:text-2xl font-bold text-iof">{analytics.totalCourses}</p>
        </div>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">Completed</h3>
          <p className="text-lg sm:text-2xl font-bold text-green-600">{analytics.completedCourses}</p>
        </div>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">In Progress</h3>
          <p className="text-lg sm:text-2xl font-bold text-blue-600">{analytics.inProgressCourses}</p>
        </div>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">Completion Rate</h3>
          <p className="text-lg sm:text-2xl font-bold text-purple-600">{analytics.completionRate}%</p>
        </div>
      </div>

      {/* Certificates and Categories - Mobile Optimized */}
      <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-8">
        {/* Certificates Section */}
        <div className="mb-6 sm:mb-0">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Earned Certificates
            {analytics.certificates.length > 0 && (
              <span className="text-sm text-gray-500 ml-2">
                ({analytics.certificates.length} total)
              </span>
            )}
          </h3>
          
          {analytics.certificates.length > 0 ? (
            <>
              <div className="space-y-3 sm:space-y-4">
                {currentCertificates.map((cert) => (
                  <div 
                    key={cert.id} 
                    className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <h4 className="font-medium text-iof text-sm sm:text-base">{cert.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {cert.category}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Completed: {new Date(cert.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCertificateClick(cert.id)}
                        className="w-full sm:w-auto bg-iof text-white px-3 py-1 rounded text-sm hover:bg-iof-dark transition-colors"
                      >
                        View Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center items-center space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-2 py-1 rounded ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-iof text-white hover:bg-iof-dark'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`w-8 h-8 rounded-full ${
                          currentPage === index + 1
                            ? 'bg-iof text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-2 py-1 rounded ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-iof text-white hover:bg-iof-dark'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm sm:text-base text-gray-500">No certificates earned yet.</p>
          )}
        </div>

        {/* Category Preferences Section */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Learning Preferences</h3>
          {Object.keys(analytics.preferredCategories).length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(analytics.preferredCategories)
                .sort(([,a], [,b]) => b - a)
                .map(([category, count]) => (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="font-medium">{category}</span>
                      <span className="text-gray-500">
                        {count} {count === 1 ? 'course' : 'courses'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div
                        className="bg-iof rounded-full h-1.5 sm:h-2 transition-all duration-500"
                        style={{
                          width: `${(count / analytics.totalCourses) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm sm:text-base text-gray-500">No course preferences yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseUserAnalytics; 