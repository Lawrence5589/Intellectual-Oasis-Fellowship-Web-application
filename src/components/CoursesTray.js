import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, getDocs, orderBy, limit, where, getDoc, doc } from 'firebase/firestore';
import LoadingIndicator from './LoadingIndicator';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

function CoursesTray() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const visibleCards = 4;

  useEffect(() => {
    const fetchTopCourses = async () => {
      try {
        // First, get user's enrolled courses
        const userProgressRef = collection(db, 'users', user.uid, 'courseProgress');
        const userProgressSnapshot = await getDocs(userProgressRef);
        const enrolledCourseIds = new Set(
          userProgressSnapshot.docs.map(doc => doc.id)
        );

        // Fetch all courses with enrollment count
        const coursesRef = collection(db, 'courses');
        const coursesSnapshot = await getDocs(coursesRef);
        
        // Process and sort courses by enrollment count
        const coursesWithEnrollment = await Promise.all(
          coursesSnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              enrollmentCount: 0
            }))
            .filter(course => !enrolledCourseIds.has(course.id))
        );

        // Get enrollment counts for each course
        await Promise.all(
          coursesWithEnrollment.map(async (course) => {
            const enrollmentQuery = collection(db, 'users');
            const enrollmentSnapshot = await getDocs(
              query(
                collection(db, 'users'),
                where(`courseProgress.${course.id}`, '!=', null)
              )
            );
            course.enrollmentCount = enrollmentSnapshot.size;
          })
        );

        // Sort by enrollment count and take top 15
        const topCourses = coursesWithEnrollment
          .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
          .slice(0, 15);

        setCourses(topCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTopCourses();
    }
  }, [user]);

  const scroll = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    const cardWidth = 300; // Width of each card
    const gap = 16; // Gap between cards (4 in tailwind = 16px)
    const scrollAmount = (cardWidth + gap) * visibleCards;
    
    const maxScroll = Math.max(0, courses.length - visibleCards) * (cardWidth + gap);
    const newPosition = direction === 'left'
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(maxScroll, scrollPosition + scrollAmount);

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setScrollPosition(newPosition);
  };

  const handleLearnMore = (courseId, event) => {
    event.stopPropagation();
    navigate('/courses');
  };

  const handleCardClick = () => {
    navigate('/courses');
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  const totalSlides = Math.ceil(courses.length / visibleCards);
  const currentSlide = Math.floor(scrollPosition / ((300 + 16) * visibleCards));

  return (
    <section className="bg-white p-4">
      <h2 className="text-xl md:text-2xl font-bold text-iof mb-4">
        Popular Learning Paths
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
        
        {scrollPosition < (courses.length - visibleCards) * (300 + 16) && (
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
            width: `${(300 * visibleCards) + (16 * (visibleCards - 1))}px`, // Width for 4 cards with gaps
            margin: '0 auto'
          }}
        >
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex-none w-[300px] transform transition-transform duration-300 hover:scale-105"
              onClick={handleCardClick}
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
                    {course.difficulty || "All Levels"}
                  </div>
                  <div className="absolute top-2 left-2 bg-white/90 text-black px-3 py-1 rounded-full text-xs font-medium">
                    {course.enrollmentCount} enrolled
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
                      onClick={(e) => handleLearnMore(course.id, e)}
                      className="text-sm text-iof hover:text-iof-dark font-medium transition-colors duration-300"
                    >
                      Learn More
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

export default CoursesTray;