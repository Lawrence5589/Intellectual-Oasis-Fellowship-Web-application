import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from '../common/LoadingIndicator';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function EnrolledCourses({ enrolledCourses }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courseDetails, setCourseDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);
  const visibleCards = 4;

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!enrolledCourses || !Array.isArray(enrolledCourses)) {
        setLoading(false);
        return;
      }

      try {
        const detailedCourses = await Promise.all(
          enrolledCourses.map(async (course) => {
            const courseDoc = await getDoc(doc(db, 'courses', course.courseId));
            if (!courseDoc.exists()) return null;
            const courseData = courseDoc.data();

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

        setCourseDetails(detailedCourses.filter(Boolean));
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
      setLoading(false);
    };

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

  if (loading) return <LoadingIndicator />;

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
    <section className="bg-white p-4">
      <h2 className="text-xl md:text-2xl font-bold text-iof mb-4">
        Your Learning Journey
      </h2>
      
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
              className="flex-none w-[300px] transform transition-transform duration-300 hover:scale-105"
              onClick={() => handleCourseClick(course.id)}
            >
              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img 
                    src={course.image || "/images/rcourses.png"}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 text-black px-3 py-1 rounded-full text-xs font-medium">
                    {Math.round(course.progress)}% Complete
                  </div>
                  <div className="absolute top-2 left-2 bg-white/90 text-black px-3 py-1 rounded-full text-xs font-medium">
                    {course.isArchived ? 'Completed' : 'In Progress'}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {course.duration || "Self-paced"}
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
    </section>
  );
}

export default EnrolledCourses;