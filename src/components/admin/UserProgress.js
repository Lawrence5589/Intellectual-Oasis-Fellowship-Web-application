import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from '../common/LoadingIndicator';
import html2pdf from 'html2pdf.js';

function UserProgress() {
  const [usersProgress, setUsersProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchUsersProgress = async () => {
      try {
        if (!user) {
          setError('Please log in to access this page');
          setLoading(false);
          return;
        }

        // Verify admin status
        const adminDoc = await getDoc(doc(db, 'users', user.uid));
        if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
          return;
        }

        // Get all users with their data
        const usersQuery = query(collection(db, 'users'), orderBy('name'));
        const usersSnapshot = await getDocs(usersQuery);
        const progressData = [];

        // Process each user's data
        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          
          try {
            // Get enrolled courses
            const courseProgressQuery = query(
              collection(db, 'users', userDoc.id, 'courseProgress')
            );
            const courseProgressSnapshot = await getDocs(courseProgressQuery);

            // Get exam results
            const examResultsQuery = query(
              collection(db, 'users', userDoc.id, 'examResults'),
              orderBy('timestamp', 'desc')
            );
            const examResultsSnapshot = await getDocs(examResultsQuery);

            const examResults = examResultsSnapshot.docs.map(doc => ({
              ...doc.data(),
              id: doc.id
            }));
            
            // Calculate statistics
            const stats = {
              enrolledCourses: courseProgressSnapshot.size,
              totalExams: examResults.length,
              passedExams: examResults.filter(result => result.score >= 75).length,
              failedExams: examResults.filter(result => result.score < 75).length,
              averageScore: examResults.length > 0 
                ? (examResults.reduce((acc, curr) => acc + curr.score, 0) / examResults.length).toFixed(1)
                : 0
            };

            progressData.push({
              id: userDoc.id,
              name: userData.name || 'N/A',
              email: userData.email || 'N/A',
              lastActive: userData.lastLogin ? new Date(userData.lastLogin.seconds * 1000) : null,
              ...stats
            });
          } catch (err) {
            console.error(`Error processing user ${userDoc.id}:`, err);
            // Continue with next user instead of breaking the entire loop
            continue;
          }
        }

        setUsersProgress(progressData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user progress:', error);
        setError('Failed to fetch user progress data. Please try again.');
        setLoading(false);
      }
    };

    fetchUsersProgress();
  }, [user]);

  const exportToPDF = () => {
    const element = document.getElementById('progress-table');
    const opt = {
      margin: 1,
      filename: 'user-progress-report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const filteredUsers = usersProgress.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <LoadingIndicator />;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">User Progress Tracking</h2>
        <button
          onClick={exportToPDF}
          className="bg-[rgb(130,88,18)] text-white px-4 py-2 rounded hover:bg-[rgb(110,68,0)]"
        >
          Export Report
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table id="progress-table" className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled Courses</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Exams</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.enrolledCourses}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.totalExams}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  {user.passedExams}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  {user.failedExams}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.averageScore}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastActive ? user.lastActive.toLocaleDateString() : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            Showing {Math.min(((currentPage - 1) * ITEMS_PER_PAGE) + 1, filteredUsers.length)} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of{' '}
            {filteredUsers.length} entries
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[rgb(130,88,18)] text-white hover:bg-[rgb(110,68,0)]'
            }`}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? 'bg-[rgb(130,88,18)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[rgb(130,88,18)] text-white hover:bg-[rgb(110,68,0)]'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProgress;
