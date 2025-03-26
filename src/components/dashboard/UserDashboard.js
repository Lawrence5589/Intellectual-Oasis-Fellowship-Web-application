import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where, limit, startAfter, getDoc, doc } from 'firebase/firestore';
import CoursesTray from '../courses/CoursesTray';
import EnrolledCourses from '../courses/EnrolledCourses';
import QuizSection from './QuizSection';
import Announcements from './Announcements';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from '../common/LoadingIndicator';
import CourseUserAnalytics from '../courses/CourseUserAnalytics';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [data, setData] = useState({
    enrolledCourses: [],
    announcements: [],
    lastAnnouncementDoc: null,
    hasMoreAnnouncements: true
  });

  // Cache key for local storage
  const CACHE_KEY = `dashboard_${user?.uid}`;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchFromCache = useCallback(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data: cachedData, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        setData(prevData => ({ ...prevData, ...cachedData }));
        return true;
      }
    }
    return false;
  }, [CACHE_KEY]);

  const updateCache = useCallback((newData) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: newData,
      timestamp: Date.now()
    }));
  }, [CACHE_KEY]);

  // Parallel data fetching
  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      // Check cache first
      if (fetchFromCache()) {
        setLoading(false);
        return;
      }

      // Parallel fetching of courses and announcements
      const [enrolledCoursesData, announcementsData] = await Promise.all([
        fetchEnrolledCourses(),
        fetchAnnouncements()
      ]);

      const newData = {
        enrolledCourses: enrolledCoursesData,
        announcements: announcementsData.announcements,
        lastAnnouncementDoc: announcementsData.lastDoc,
        hasMoreAnnouncements: announcementsData.hasMore
      };

      setData(newData);
      updateCache(newData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, navigate, fetchFromCache, updateCache]);

  const fetchEnrolledCourses = async () => {
    const enrolledRef = collection(db, 'users', user.uid, 'courseProgress');
    const enrolledSnapshot = await getDocs(enrolledRef);
    return enrolledSnapshot.docs.map(doc => ({
      courseId: doc.id,
      ...doc.data()
    }));
  };

  const fetchAnnouncements = async (lastDoc = null) => {
    const ANNOUNCEMENTS_PER_PAGE = 5;
    let announcementsQuery = query(
      collection(db, 'announcements'),
      where('active', '==', true),
      limit(ANNOUNCEMENTS_PER_PAGE)
    );

    if (lastDoc) {
      announcementsQuery = query(
        announcementsQuery,
        startAfter(lastDoc)
      );
    }

    const snapshot = await getDocs(announcementsQuery);
    return {
      announcements: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === ANNOUNCEMENTS_PER_PAGE
    };
  };

  // Load more announcements
  const loadMoreAnnouncements = async () => {
    if (!data.hasMoreAnnouncements) return;

    const moreAnnouncements = await fetchAnnouncements(data.lastAnnouncementDoc);
    setData(prevData => ({
      ...prevData,
      announcements: [...prevData.announcements, ...moreAnnouncements.announcements],
      lastAnnouncementDoc: moreAnnouncements.lastDoc,
      hasMoreAnnouncements: moreAnnouncements.hasMore
    }));
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center p-2 ${
            activeTab === 'overview' ? 'text-iof' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">📊</span>
          <span className="text-xs">Overview</span>
        </button>
        <button
          onClick={() => navigate('/courses')}
          className="flex flex-col items-center p-2 text-gray-500"
        >
          <span className="text-xl">📚</span>
          <span className="text-xs">Courses</span>
        </button>
        <button
          onClick={() => setActiveTab('certs')}
          className={`flex flex-col items-center p-2 ${
            activeTab === 'certs' ? 'text-iof' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">🏆</span>
          <span className="text-xs">Certs</span>
        </button>
        <button
          onClick={() => setActiveTab('more')}
          className={`flex flex-col items-center p-2 ${
            activeTab === 'more' ? 'text-iof' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">⚡</span>
          <span className="text-xs">More</span>
        </button>
      </div>
    </div>
  );

  const renderMobileContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4 pb-20">
            <Announcements announcements={data.announcements} />
            <CourseUserAnalytics />
            <QuizSection />
          </div>
        );
      case 'courses':
        navigate('/courses');
        return null;
      case 'certs':
        return (
          <div className="pb-20">
            <CourseUserAnalytics />
          </div>
        );
      case 'more':
        return (
          <div className="space-y-4 pb-20">
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('/blog')}
                  className="p-4 bg-gray-50 rounded-lg flex flex-col items-center"
                >
                  <span className="text-2xl mb-2">💭</span>
                  <span className="text-sm">Blog</span>
                </button>
                <button 
                  onClick={() => navigate('/scholarships/my-applications')}
                  className="p-4 bg-gray-50 rounded-lg flex flex-col items-center"
                >
                  <span className="text-2xl mb-2">📝</span>
                  <span className="text-sm">My Applications</span>
                </button>
                <button 
                  onClick={() => navigate('/profile-settings')}
                  className="p-4 bg-gray-50 rounded-lg flex flex-col items-center"
                >
                  <span className="text-2xl mb-2">⚙️</span>
                  <span className="text-sm">Settings</span>
                </button>
                <button 
                  onClick={handleSignOut}
                  className="p-4 bg-gray-50 rounded-lg flex flex-col items-center"
                >
                  <span className="text-2xl mb-2">🚪</span>
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="flex min-h-screen bg-gray-100">     
      <div className="flex-1 flex flex-col">
        {/* Main Content */}
        
        <main className="p-4 flex-1">
          {isMobile ? renderMobileContent() : (
            <div className="space-y-8">
              <Announcements announcements={data.announcements} />
              <CoursesTray />
              <EnrolledCourses enrolledCourses={data.enrolledCourses} />
              <QuizSection />
              <CourseUserAnalytics />
            </div>
          )}
        </main>

        {/* Mobile Navigation */}
        {isMobile && <MobileNavigation />}
      </div>
    </div>
  );
}

export default Dashboard;