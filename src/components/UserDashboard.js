import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Sidebar from './Sidebar';
import CoursesTray from './CoursesTray';
import EnrolledCourses from './EnrolledCourses';
import QuizSection from './QuizSection';
import Leaderboard from './Leaderboard';
import Announcements from './Announcements';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from './LoadingIndicator';
import CourseUserAnalytics from './CourseUserAnalytics';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [data, setData] = useState({
    enrolledCourses: [],
    leaderboardData: [],
    announcements: []
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch enrolled courses
        const enrolledRef = collection(db, 'users', user.uid, 'enrolledCourses');
        const enrolledSnapshot = await getDocs(enrolledRef);
        const enrolledCourses = enrolledSnapshot.docs.map(doc => ({
          courseId: doc.id,
          ...doc.data()
        }));

        // Fetch leaderboard data
        const leaderboardRef = collection(db, 'leaderboard');
        const leaderboardSnapshot = await getDocs(leaderboardRef);
        const leaderboardData = leaderboardSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch announcements
        const announcementsRef = collection(db, 'announcements');
        const announcementsQuery = query(announcementsRef, where('active', '==', true));
        const announcementsSnapshot = await getDocs(announcementsQuery);
        const announcements = announcementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setData({
          enrolledCourses,
          leaderboardData,
          announcements
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  const handleSignOut = () => {
    navigate('/login');
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
          className={`flex flex-col items-center p-2 ${
            activeTab === 'courses' ? 'text-iof' : 'text-gray-500'
          }`}
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
            <Leaderboard data={data.leaderboardData} />
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('/forums')}
                  className="p-4 bg-gray-50 rounded-lg flex flex-col items-center"
                >
                  <span className="text-2xl mb-2">💭</span>
                  <span className="text-sm">Forums</span>
                </button>
                <button 
                  onClick={() => navigate('/resources')}
                  className="p-4 bg-gray-50 rounded-lg flex flex-col items-center"
                >
                  <span className="text-2xl mb-2">📌</span>
                  <span className="text-sm">Resources</span>
                </button>
                <button 
                  onClick={() => navigate('/settings')}
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
      {/* Only show sidebar on desktop */}
      {!isMobile && <Sidebar open={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />}
      
      <div className="flex-1 flex flex-col">
        {/* Main Content */}
        <main className="p-4 flex-1">
          {isMobile ? renderMobileContent() : (
            <div className="space-y-8">
              <Announcements announcements={data.announcements} />
              <CourseUserAnalytics />
              <CoursesTray />
              <EnrolledCourses enrolledCourses={data.enrolledCourses} />
              <QuizSection />
              <Leaderboard data={data.leaderboardData} />
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