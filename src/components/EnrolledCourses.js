import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from './LoadingIndicator';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function EnrolledCourses({ enrolledCourses }) {
  console.log('Received enrolledCourses prop:', enrolledCourses);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courseDetails, setCourseDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);
  const visibleCards = 4;

  useEffect(() => {
    const fetchCourseDetails = async () => {
      // Guard clause to check if enrolledCourses is valid
      if (!enrolledCourses || !Array.isArray(enrolledCourses)) {
        console.error('Invalid enrolledCourses:', enrolledCourses);
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('Starting to fetch course details for:', enrolledCourses);
      try {
        const detailedCourses = await Promise.all(
          enrolledCourses.map(async (course) => {
            console.log('Fetching details for course:', course); // Add this debug log
            // Fetch course details
            const courseDoc = await getDoc(doc(db, 'courses', course.courseId));
            if (!courseDoc.exists()) {
              console.error('Course document not found:', course.courseId);
              return null;
            }
            const courseData = courseDoc.data();

            // Fetch progress
            const progressDoc = await getDoc(
              doc(db, 'users', user.uid, 'courseProgress', course.courseId)
            );
            const progress = progressDoc.exists() ? progressDoc.data().progress : 0;

            return {
              id: course.courseId,
              ...courseData,
              progress,
              isArchived: progress === 100
            };
          })
        );
        setCourseDetails(detailedCourses);
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
      setLoading(false);
    };

    // Set loading to false if there are no enrolled courses
    if (enrolledCourses.length === 0) {
      setLoading(false);
    } else {
      fetchCourseDetails();
    }
  }, [enrolledCourses, user.uid]);

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const scroll = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    const cardWidth = 300;
    const gap = 16;
    const scrollAmount = (cardWidth + gap) * visibleCards;
    
    const maxScroll = Math.max(0, courseDetails.length - visibleCards) * (cardWidth + gap);
    const newPosition = direction === 'left'
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(maxScroll, scrollPosition + scrollAmount);

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setScrollPosition(newPosition);
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  // Show a message if no courses are enrolled
  if (courseDetails.length === 0) {
    return (
      <section id="enrolled-courses" className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Enrolled Courses</h2>
        <p className="text-gray-600">No courses enrolled yet.</p>
      </section>
    );
  }

  const totalSlides = Math.ceil(courseDetails.length / visibleCards);
  const currentSlide = Math.floor(scrollPosition / ((300 + 16) * visibleCards));

  return (
    <section id="enrolled-courses" className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-iof mb-8">Your Learning Journey</h2>
        
        <div className="relative max-w-[1300px] mx-auto">
          {/* Navigation Buttons */}
          {scrollPosition > 0 && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-iof rounded-full p-2 shadow-lg transition-all duration-300 -ml-4"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
          )}
          
          {scrollPosition < (courseDetails.length - visibleCards) * (300 + 16) && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-iof rounded-full p-2 shadow-lg transition-all duration-300 -mr-4"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          )}

          {/* Course Cards Container */}
          <div 
            ref={containerRef}
            className="overflow-x-hidden relative flex gap-4 px-6 py-4 scroll-smooth"
            style={{
              WebkitOverflowScrolling: 'touch',
              width: `${(300 * visibleCards) + (16 * (visibleCards - 1))}px`,
              margin: '0 auto'
            }}
          >
            {courseDetails.map((course) => (
              <div
                key={course.id}
                className={`flex-none w-[300px] transform transition-transform duration-300 hover:scale-105 ${
                  course.isArchived ? 'opacity-75' : ''
                }`}
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img 
                      src="/images/rcourses.png" 
                      alt={course.title} 
                      className="w-full h-40 object-cover rounded-t-lg"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                      <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 transform -rotate-90">
                          <circle
                            className="text-gray-200"
                            strokeWidth="4"
                            stroke="currentColor"
                            fill="transparent"
                            r="16"
                            cx="20"
                            cy="20"
                          />
                          <circle
                            className="text-iof"
                            strokeWidth="4"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="16"
                            cx="20"
                            cy="20"
                            strokeDasharray={`${course.progress * 1.005} 100`}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                          {Math.round(course.progress)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        course.isArchived 
                          ? 'bg-gray-200 text-gray-700' 
                          : 'bg-iof/10 text-iof font-medium'
                      }`}>
                        {course.isArchived ? 'Completed' : 'In Progress'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseClick(course.id);
                        }}
                        className="text-sm text-iof hover:text-iof-dark font-medium transition-colors duration-300"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-iof w-4' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => {
                  const newPosition = index * (300 + 16) * visibleCards;
                  containerRef.current?.scrollTo({
                    left: newPosition,
                    behavior: 'smooth'
                  });
                  setScrollPosition(newPosition);
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default EnrolledCourses;