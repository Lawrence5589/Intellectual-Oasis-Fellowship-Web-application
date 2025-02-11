import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from '../common/LoadingIndicator';
import { useAuth } from '../contexts/AuthContext';
import { getDoc, doc, setDoc } from 'firebase/firestore';

function CoursePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [certificationCourses, setCertificationCourses] = useState({});
  const [recommendedCourses, setRecommendedCourses] = useState({});
  const [activeCategory, setActiveCategory] = useState({
    certification: null,
    recommended: null,
  });
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const allCategories = [
    'Arts and Humanities', 'Biology and Health', 'Business', 'Information Technology', 'Language Learning',
    'Personal Development', 'Social Sciences', 'Teaching and Academics'
  ];


  useEffect(() => {
    setLoading(true);
    const fetchGroupedCourses = (type, updateCourses) => {
      const courseQuery = query(collection(db, 'courses'), where('type', '==', type));
      const unsubscribe = onSnapshot(courseQuery, (snapshot) => {
        console.log('Raw courses:', snapshot.docs.map(doc => ({
          title: doc.data().title,
          status: doc.data().status
        })));

        const courses = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

        // Sort courses before grouping
        courses.sort((a, b) => {
          console.log('Comparing:', {
            courseA: { title: a.title, status: a.status },
            courseB: { title: b.title, status: b.status }
          });
          
          // Convert undefined or null status to 'available'
          const statusA = a.status || 'available';
          const statusB = b.status || 'available';

          // Assign numeric values for sorting
          const getStatusValue = (status) => {
            switch (status) {
              case 'coming_soon': return 2;
              case 'available': return 1;
              default: return 1;
            }
          };

          return getStatusValue(statusA) - getStatusValue(statusB);
        });

        console.log('Sorted courses:', courses.map(course => ({
          title: course.title,
          status: course.status
        })));

        const groupedByCategory = courses.reduce((groups, course) => {
          const category = course.category || 'Uncategorized';
          if (!groups[category]) {
            groups[category] = [];
          }
          groups[category].push(course);
          return groups;
        }, {});

        console.log('Grouped courses:', groupedByCategory);

        updateCourses(groupedByCategory);
      }, (error) => {
        console.error('Error fetching courses:', error);
      });

      return unsubscribe;
    };

    const unsubscribeCert = fetchGroupedCourses('certification', setCertificationCourses);
    const unsubscribeRec = fetchGroupedCourses('non-certification', setRecommendedCourses);
    setLoading(false);

    // Cleanup: unsubscribe from the snapshot listener on unmount
    return () => {
      unsubscribeCert();
      unsubscribeRec();
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const CourseCard = ({ course }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [courseProgress, setCourseProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
      const fetchEnrollmentAndProgress = async () => {
        setLoading(true);
        try {
          // First check completedSubCourses for most accurate progress
          const completedRef = doc(db, 'users', user.uid, 'completedSubCourses', course.id);
          const completedDoc = await getDoc(completedRef);
          
          if (completedDoc.exists()) {
            setIsEnrolled(true);
            const completedData = completedDoc.data().completed || {};
            
            // Calculate total subcourses
            let totalSubCourses = 0;
            course.modules.forEach(module => {
              totalSubCourses += module.subCourses?.length || 0;
            });

            // Calculate completed count
            const completedCount = Object.keys(completedData).length;
            const calculatedProgress = totalSubCourses > 0 ? 
              (completedCount / totalSubCourses) * 100 : 0;

            setCourseProgress(calculatedProgress);

            // Update progress document for consistency
            const progressRef = doc(db, 'users', user.uid, 'courseProgress', course.id);
            await setDoc(progressRef, {
              progress: calculatedProgress,
              enrolledAt: completedDoc.data().firstCompletedAt || new Date().toISOString(),
              lastUpdated: new Date().toISOString()
            }, { merge: true });
          } else {
            // Fallback to courseProgress collection
            const progressRef = doc(db, 'users', user.uid, 'courseProgress', course.id);
            const progressDoc = await getDoc(progressRef);
            
            if (progressDoc.exists()) {
              setIsEnrolled(true);
              setCourseProgress(progressDoc.data().progress || 0);
            }
          }
        } catch (error) {
          console.error('Error fetching enrollment and progress:', error);
        }
        setLoading(false);
      };

      if (user && course.id) {
        fetchEnrollmentAndProgress();
      }
    }, [course.id, user]);

    const handleCertificateDownload = () => {
      if (courseProgress === 100) {
        navigate(`/courses/${course.id}/certificate`);
      } else {
        alert('Course must be fully completed to view certificate');
      }
    };

    const toggleDetails = () => {
      if (courseProgress === 100) {
        handleCertificateDownload();
      } else {
        setShowDetails(!showDetails);
      }
    };

    const handleLearnClick = () => {
      if (isEnrolled) {
        navigate(`/courses/${course.id}`);
      } else {
        setShowModal(true);
      }
    };

    const handleEnroll = async () => {
      try {
        setLoading(true);
        // Initialize progress tracking
        await setDoc(doc(db, 'users', user.uid, 'courseProgress', course.id), {
          progress: 0,
          enrolledAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
        
        // Initialize completed subcourses document
        await setDoc(doc(db, 'users', user.uid, 'completedSubCourses', course.id), {
          completed: {},
          firstCompletedAt: new Date().toISOString()
        });

        setIsEnrolled(true);
        setCourseProgress(0);
        setShowModal(false);
        navigate(`/courses/${course.id}`);
      } catch (error) {
        console.error('Error enrolling in course:', error);
        alert('Failed to enroll in course. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const handleModalClose = () => {
      setShowModal(false);
    };

    if (loading) {
      return <LoadingIndicator />;
    }

    // Mobile view
    const MobileView = () => (
      <div className={`md:hidden bg-white rounded-lg shadow p-3 ${course.status === 'coming_soon' ? 'grayscale' : ''}`}>
        <div className="flex items-center space-x-3">
          <img src="/images/rcourses.png" alt={course.title} className="w-16 h-16 object-cover rounded" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 line-clamp-1">{course.title}</h3>
            {isEnrolled && (
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[rgb(130,88,18)] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${courseProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{Math.round(courseProgress)}% Complete</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex justify-between gap-2">
          {course.status === 'coming_soon' ? (
            <button
              disabled
              className="w-full bg-gray-400 text-white px-3 py-1.5 rounded text-sm cursor-not-allowed"
            >
              Coming Soon
            </button>
          ) : (
            <>
              <button
                onClick={handleLearnClick}
                className="flex-1 bg-[rgb(130,88,18)] text-white px-3 py-1.5 rounded text-sm"
              >
                {isEnrolled ? (courseProgress === 100 ? 'Review' : 'Continue') : 'Enroll'}
              </button>
              <button
                onClick={toggleDetails}
                className="flex-1 bg-[rgb(130,88,18)] text-white px-3 py-1.5 rounded text-sm"
              >
                {courseProgress === 100 ? "Certificate" : "Details"}
              </button>
            </>
          )}
        </div>

        {showDetails && courseProgress !== 100 && (
          <div className="mt-3 text-sm text-gray-700 border-t pt-3">
            <p className="mb-1"><strong>Difficulty:</strong> {course.difficulty}</p>
            <p className="mb-1"><strong>Prerequisites:</strong> {course.prerequisites}</p>
            <p className="line-clamp-2"><strong>Objectives:</strong> {course.learningObjectives}</p>
          </div>
        )}
      </div>
    );

    // Desktop view (existing card view)
    const DesktopView = () => (
      <div className={`hidden md:block bg-white rounded-lg shadow-lg overflow-hidden relative p-4 w-full md:w-72 lg:w-80 h-auto ${course.status === 'coming_soon' ? 'grayscale' : ''}`}>
        {course.status === 'coming_soon' && (
          <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-full z-20">
            Coming Soon
          </div>
        )}
        <img src="/images/rcourses.png" alt={course.title} className="w-full h-32 object-cover" />
        
        {/* Progress Indicator for Enrolled Users */}
        {isEnrolled && (
          <div className="absolute top-4 right-4 flex items-center bg-white rounded-full p-1 shadow">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  className="text-gray-200"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r="20"
                  cx="24"
                  cy="24"
                />
                <circle
                  className="text-[rgb(130,88,18)]"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="20"
                  cx="24"
                  cy="24"
                  strokeDasharray={`${courseProgress * 1.256} 126`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                {Math.round(courseProgress)}%
              </span>
            </div>
          </div>
        )}

        <div className="p-2">
          <h3 className="text-lg font-bold text-gray-800">{course.title}</h3>
          <p className="text-gray-600">{course.description}</p>
          
          {/* Progress Bar for Mobile (Enrolled Users) */}
          {isEnrolled && (
            <div className="mt-2 md:hidden">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div
                  className="bg-[rgb(130,88,18)] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${courseProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 text-right">{Math.round(courseProgress)}% Complete</p>
            </div>
          )}

          <div className="flex justify-between mt-2">
            {course.status === 'coming_soon' ? (
              <button
                disabled
                className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed w-full"
              >
                Coming Soon
              </button>
            ) : (
              <>
                <button
                  onClick={handleLearnClick}
                  className="bg-[rgb(130,88,18)] text-white px-4 py-2 rounded-lg hover:bg-[rgb(110,68,0)] transition-colors"
                >
                  {isEnrolled ? (courseProgress === 100 ? 'Review' : 'Continue') : 'Enroll'}
                </button>
                <button
                  onClick={toggleDetails}
                  className="bg-[rgb(130,88,18)] text-white px-4 py-2 rounded-lg hover:bg-[rgb(110,68,0)] transition-colors"
                >
                  {courseProgress === 100 ? "Download Certificate" : (showDetails ? "Hide Details" : "Show Details")}
                </button>
              </>
            )}
          </div>

          {showDetails && courseProgress !== 100 && (
            <div className="mt-4 text-sm text-gray-700">
              <p><strong>Difficulty:</strong> {course.difficulty}</p>
              <p><strong>Prerequisites:</strong> {course.prerequisites}</p>
              <p><strong>Learning Objectives:</strong> {course.learningObjectives}</p>
              <p><strong>Target Audience:</strong> {course.targetAudience}</p>
              {isEnrolled && (
                <p className="mt-2">
                  <strong>Status:</strong>{' '}
                  {courseProgress === 100 ? 'Completed' : 
                   courseProgress > 0 ? 'In Progress' : 'Not Started'}
                </p>
              )}
            </div>
          )}
        </div>

        {showModal && (
          <Modal onClose={handleModalClose}>
            {isEnrolled ? (
              <div>
                <h2 className="text-xl font-bold mb-4">Course Progress</h2>
                <p>Your current progress is {Math.round(courseProgress)}%</p>
                <button 
                  onClick={() => navigate(`/courses/${course.id}`)} 
                  className="mt-4 bg-[rgb(130,88,18)] text-white px-4 py-2 rounded-lg hover:bg-[rgb(110,68,0)]"
                >
                  Continue Learning
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-4">Enroll in {course.title}</h2>
                <p>Would you like to enroll in this course?</p>
                <button 
                  onClick={handleEnroll} 
                  className="mt-4 bg-[rgb(130,88,18)] text-white px-4 py-2 rounded-lg hover:bg-[rgb(110,68,0)]"
                >
                  Enroll Now
                </button>
              </div>
            )}
          </Modal>
        )}
      </div>
    );

    return (
      <>
        <MobileView />
        <DesktopView />
      </>
    );
  };

  const CategoryPane = ({ title, coursesByCategory, paneType }) => {
    const toggleCategory = (category) => {
      setActiveCategory(prev => ({
        ...prev,
        [paneType]: prev[paneType] === category ? null : category
      }));
    };

    return (
      <section className="flex flex-col md:flex-row mb-16">
        <aside className="w-full md:w-1/4 p-4 bg-gray-100">
          <h2 className="text-2xl font-bold mb-4">{title} Categories</h2>
          <div className="space-y-2">
            {allCategories.map(category => (
              <div
                key={category}
                className={`p-2 cursor-pointer ${activeCategory[paneType] === category ? 'bg-gray-300' : 'bg-gray-200'} rounded-lg`}
                onClick={() => toggleCategory(category)}
              >
                {category} ({(coursesByCategory[category] || []).length})
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-4">
          {allCategories.map(category => (
            activeCategory[paneType] === category && (
              <section
                key={category}
                className="transition-all duration-500 ease-in-out"
              >
                <h3 className="text-3xl font-bold mb-4">{category} Courses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(coursesByCategory[category] || []).map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
            )
          ))}
        </main>
      </section>
    );
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const MobileNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex flex-col items-center p-2 text-gray-500"
        >
          <span className="text-xl">📊</span>
          <span className="text-xs">Overview</span>
        </button>
        <button
          onClick={() => navigate('/courses')}
          className="flex flex-col items-center p-2 text-iof"
        >
          <span className="text-xl">📚</span>
          <span className="text-xs">Courses</span>
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex flex-col items-center p-2 text-gray-500"
        >
          <span className="text-xl">🏆</span>
          <span className="text-xs">Certs</span>
        </button>
        <button
          onClick={() => navigate('/more')}
          className="flex flex-col items-center p-2 text-gray-500"
        >
          <span className="text-xl">⚡</span>
          <span className="text-xs">More</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-xl font-bold text-iof">Courses</h1>
        </header>
        <main className={`p-6 space-y-8 ${isMobile ? 'pb-24' : ''}`}>
          {loading ? (
            <LoadingIndicator />
          ) : (
            <>
              <CategoryPane title="Free" coursesByCategory={recommendedCourses} paneType="recommended" />
              <CategoryPane title="Certification" coursesByCategory={certificationCourses} paneType="certification" />
            </>
          )}
        </main>
        {isMobile && <MobileNavigation />}
      </div>
    </div>
  );
}

function checkUserEnrollment(courseId) {
  // Placeholder function for checking if the user is enrolled in the course
  // Replace this with actual logic to fetch user enrollment status from your backend
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(false); // Replace with actual enrollment check
    }, 1000);
  });
}

function enrollUserInCourse(courseId) {
  // Placeholder function for enrolling a user in a course
  // Replace this with actual logic to enroll user in the course in your backend
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
}

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-4 shadow-lg w-96">
        {children}
        <button onClick={onClose} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg">Close</button>
      </div>
    </div>
  );
};

export default CoursePage;