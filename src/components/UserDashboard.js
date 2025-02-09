import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import PrivateRoute from './PrivateRoute';
import Sidebar from './Sidebar';
import CoursesTray from './CoursesTray';
import EnrolledCourses from './EnrolledCourses';
import QuizSection from './QuizSection';
import Leaderboard from './Leaderboard';
import Announcements from './Announcements';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from './LoadingIndicator';
import CourseUserAnalytics from './CourseUserAnalytics';

function Dashboard() {
  const { user } = useAuth(); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchCourses = async () => {
          try {
            const coursesSnapshot = await getDocs(collection(db, 'courses'));
            setCourses(coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          } catch (error) {
            console.error('Error fetching courses:', error);
          }
        };

        const fetchEnrolledCourses = async () => {
          try {
            // Check both courseProgress and completedSubCourses collections
            const progressQuery = collection(db, 'users', user.uid, 'courseProgress');
            const progressSnapshot = await getDocs(progressQuery);
            
            const enrolledCoursesData = progressSnapshot.docs.map(doc => ({
              courseId: doc.id,
              progress: doc.data().progress,
              enrolledAt: doc.data().enrolledAt
            }));

            setEnrolledCourses(enrolledCoursesData);
          } catch (error) {
            console.error('Error fetching enrolled courses:', error);
          }
        };

        const fetchLeaderboardData = async () => {
          try {
            const leaderboardSnapshot = await getDocs(collection(db, 'leaderboard'));
            setLeaderboardData(leaderboardSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          } catch (error) {
            console.error('Error fetching leaderboard:', error);
          }
        };

        await Promise.all([
          fetchCourses(),
          fetchEnrolledCourses(),
          fetchLeaderboardData()
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar open={sidebarOpen} toggleSidebar={handleSidebarToggle} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
          <button onClick={handleSidebarToggle} className="text-2xl text-iof-dark hover:text-iof">
            &#9776; {/* Hamburger icon */}
          </button>
          <h1 className="text-xl font-bold text-iof">Dashboard</h1>
        </header>
        <main className="p-6 space-y-8">
          {loading ? (
            <LoadingIndicator />
          ) : (
            <>
              <Announcements />
              <CoursesTray />
              <EnrolledCourses enrolledCourses={enrolledCourses} />
              <QuizSection />
              <CourseUserAnalytics />
              <Leaderboard data={leaderboardData} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;