import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import PrivateRoute from './PrivateRoute';
import Sidebar from './Sidebar';
import Courses from './CoursesTray';
import EnrolledCourses from './EnrolledCourses';
import QuizSection from './QuizSection';
import Leaderboard from './Leaderboard';
import Announcements from './Announcements';
import { useAuth } from '../AuthContext';

function Dashboard() {
  const { user } = useAuth(); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        setCourses(coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    if (user) fetchCourses();  // Only fetch if user is authenticated
  }, [user]);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const enrolledQuery = query(
          collection(db, 'enrolledCourses'),
          where('userId', '==', user.uid)
        );
        const enrolledSnapshot = await getDocs(enrolledQuery);
        setEnrolledCourses(enrolledSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      }
    };
    if (user) fetchEnrolledCourses();  // Only fetch if user is authenticated
  }, [user]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const leaderboardSnapshot = await getDocs(collection(db, 'leaderboard'));
        setLeaderboardData(leaderboardSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };
    if (user) fetchLeaderboardData();  // Only fetch if user is authenticated
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
          <Announcements />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Courses courses={courses} />
            <EnrolledCourses enrolledCourses={enrolledCourses} />
            <QuizSection />
            <Leaderboard data={leaderboardData} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;