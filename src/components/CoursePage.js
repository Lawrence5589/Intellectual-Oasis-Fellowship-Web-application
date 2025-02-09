import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

function CoursePage() {
  const [certificationCourses, setCertificationCourses] = useState({});
  const [recommendedCourses, setRecommendedCourses] = useState({});
  const [activeCategory, setActiveCategory] = useState({
    certification: null,
    recommended: null,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allCategories = [
    'Arts and Humanities', 'Business', 'Information Technology', 'Language Learning',
    'Personal Development', 'Social Sciences', 'Teaching and Academics'
  ];

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchGroupedCourses = (type, updateCourses) => {
      const courseQuery = query(collection(db, 'courses'), where('type', '==', type));
      const unsubscribe = onSnapshot(courseQuery, (snapshot) => {
        // Log the entire snapshot for debugging
        console.log(`Fetched courses for type '${type}':`, snapshot.docs.map(doc => doc.data()));

        const courses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const groupedByCategory = courses.reduce((groups, course) => {
          const category = course.category || 'Uncategorized';
          if (!groups[category]) {
            groups[category] = [];
          }
          groups[category].push(course);
          return groups;
        }, {});

        // Log the grouping results
        console.log(`Grouped ${type} courses by category:`, groupedByCategory);

        updateCourses(groupedByCategory);
      }, (error) => {
        console.error('Error fetching courses:', error);
      });

      return unsubscribe;
    };

    const unsubscribeCert = fetchGroupedCourses('certification', setCertificationCourses);
    const unsubscribeRec = fetchGroupedCourses('non-certification', setRecommendedCourses);

    // Cleanup: unsubscribe from the snapshot listener on unmount
    return () => {
      unsubscribeCert();
      unsubscribeRec();
    };
  }, []);

  const CourseCard = ({ course }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchEnrollmentStatus = async () => {
        const enrolled = await checkUserEnrollment(course.id);
        setIsEnrolled(enrolled);
      };
      fetchEnrollmentStatus();
    }, [course.id]);

    const toggleDetails = () => {
      setShowDetails(!showDetails);
    };

    const handleLearnClick = () => {
      if (isEnrolled) {
        navigate(`/courses/${course.id}`);
      } else {
        setShowModal(true);
      }
    };

    const handleEnroll = async () => {
      await enrollUserInCourse(course.id);
      setIsEnrolled(true);
      setShowModal(false);
      navigate(`/courses/${course.id}`);
    };

    const handleModalClose = () => {
      setShowModal(false);
    };

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden relative p-4 w-full md:w-72 lg:w-80 h-auto">
        <img src="/images/rcourses.png" alt={course.title} className="w-full h-32 object-cover" />
        <div className="p-2">
          <h3 className="text-lg font-bold text-gray-800">{course.title}</h3>
          <p className="text-gray-600">{course.description}</p>
          <div className="flex justify-between mt-2">
            <button
              onClick={handleLearnClick}
              className="bg-[rgb(130,88,18)] text-white px-4 py-2 rounded-lg hover:bg-[rgb(110,68,0)] transition-colors"
            >
              Learn
            </button>
            <button
              onClick={toggleDetails}
              className="bg-[rgb(130,88,18)] text-white px-4 py-2 rounded-lg hover:bg-[rgb(110,68,0)] transition-colors"
            >
              {showDetails ? "Hide Details" : "Show Details"}
            </button>
          </div>
          {showDetails && (
            <div className="mt-4 text-sm text-gray-700">
              <p><strong>Difficulty:</strong> {course.difficulty}</p>
              <p><strong>Prerequisites:</strong> {course.prerequisites}</p>
              <p><strong>Learning Objectives:</strong> {course.learningObjectives}</p>
              <p><strong>Target Audience:</strong> {course.targetAudience}</p>
            </div>
          )}
        </div>

        {showModal && (
          <Modal onClose={handleModalClose}>
            {isEnrolled ? (
              <div>
                <h2 className="text-xl font-bold mb-4">You're already enrolled!</h2>
                <p>Your current progress is at {course.progress || 0}%.</p>
                <button onClick={() => navigate(`/courses/${course.id}`)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">Go to Course</button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-4">Enroll in {course.title}</h2>
                <p>Would you like to enroll in this course?</p>
                <button onClick={handleEnroll} className="bg-[rgb(130,88,18)] text-white px-4 py-2 rounded-lg hover:bg-[rgb(110,68,0)] transition-colors">Enroll</button>
              </div>
            )}
          </Modal>
        )}
      </div>
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar open={sidebarOpen} toggleSidebar={handleSidebarToggle} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
          <button onClick={handleSidebarToggle} className="text-2xl text-iof-dark hover:text-iof">
            &#9776; {/* Hamburger icon */}
          </button>
          <h1 className="text-xl font-bold text-iof">Courses</h1>
        </header>
        <main className="p-6 space-y-8">
          <CategoryPane title="Free" coursesByCategory={recommendedCourses} paneType="recommended" />
          <CategoryPane title="Certification" coursesByCategory={certificationCourses} paneType="certification" />
        </main>
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