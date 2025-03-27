import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function Analytics() {
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [scholarshipApplications, setScholarshipApplications] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role?.startsWith('admin-')) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Fetch contact submissions
      const contactQuery = query(collection(db, 'contactSubmissions'), orderBy('timestamp', 'desc'));
      const contactSnapshot = await getDocs(contactQuery);
      const contactData = contactSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContactSubmissions(contactData);

      // Fetch scholarship applications
      const scholarshipQuery = query(collection(db, 'scholarshipApplications'), orderBy('timestamp', 'desc'));
      const scholarshipSnapshot = await getDocs(scholarshipQuery);
      const scholarshipData = scholarshipSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setScholarshipApplications(scholarshipData);

      // Fetch blog posts
      const blogQuery = query(collection(db, 'blogPosts'), orderBy('timestamp', 'desc'));
      const blogSnapshot = await getDocs(blogQuery);
      const blogData = blogSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBlogPosts(blogData);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error fetching analytics data.');
    } finally {
      setLoading(false);
    }
  };

  // Contact Management Analytics
  const getContactStatusDistribution = () => {
    const statusCounts = contactSubmissions.reduce((acc, submission) => {
      acc[submission.status || 'pending'] = (acc[submission.status || 'pending'] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusCounts).map(status => status.replace('_', ' ')),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(130, 88, 18, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(130, 88, 18, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      }]
    };
  };

  const getContactSubmissionTrends = () => {
    const submissionsByDate = contactSubmissions.reduce((acc, submission) => {
      const date = submission.timestamp?.toDate().toLocaleDateString() || 'Unknown';
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const sortedDates = Object.keys(submissionsByDate).sort();

    return {
      labels: sortedDates,
      datasets: [{
        label: 'Submissions',
        data: sortedDates.map(date => submissionsByDate[date]),
        borderColor: 'rgba(130, 88, 18, 1)',
        backgroundColor: 'rgba(130, 88, 18, 0.2)',
        tension: 0.4,
      }]
    };
  };

  // Scholarship Management Analytics
  const getScholarshipStatusDistribution = () => {
    const statusCounts = scholarshipApplications.reduce((acc, application) => {
      acc[application.status || 'pending'] = (acc[application.status || 'pending'] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusCounts).map(status => status.replace('_', ' ')),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(130, 88, 18, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(130, 88, 18, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      }]
    };
  };

  const getScholarshipApplicationTrends = () => {
    const applicationsByDate = scholarshipApplications.reduce((acc, application) => {
      const date = application.timestamp?.toDate().toLocaleDateString() || 'Unknown';
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const sortedDates = Object.keys(applicationsByDate).sort();

    return {
      labels: sortedDates,
      datasets: [{
        label: 'Applications',
        data: sortedDates.map(date => applicationsByDate[date]),
        borderColor: 'rgba(130, 88, 18, 1)',
        backgroundColor: 'rgba(130, 88, 18, 0.2)',
        tension: 0.4,
      }]
    };
  };

  // Blog Management Analytics
  const getBlogPostStats = () => {
    const postsByCategory = blogPosts.reduce((acc, post) => {
      acc[post.category || 'Uncategorized'] = (acc[post.category || 'Uncategorized'] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(postsByCategory),
      datasets: [{
        data: Object.values(postsByCategory),
        backgroundColor: [
          'rgba(130, 88, 18, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(130, 88, 18, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      }]
    };
  };

  const getBlogPostTrends = () => {
    const postsByDate = blogPosts.reduce((acc, post) => {
      const date = post.timestamp?.toDate().toLocaleDateString() || 'Unknown';
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const sortedDates = Object.keys(postsByDate).sort();

    return {
      labels: sortedDates,
      datasets: [{
        label: 'Posts',
        data: sortedDates.map(date => postsByDate[date]),
        borderColor: 'rgba(130, 88, 18, 1)',
        backgroundColor: 'rgba(130, 88, 18, 0.2)',
        tension: 0.4,
      }]
    };
  };

  // Overview Statistics
  const getOverviewStats = () => {
    const totalContacts = contactSubmissions.length;
    const pendingContacts = contactSubmissions.filter(s => s.status === 'pending').length;
    const totalScholarships = scholarshipApplications.length;
    const pendingScholarships = scholarshipApplications.filter(s => s.status === 'pending').length;
    const totalBlogPosts = blogPosts.length;
    const recentBlogPosts = blogPosts.filter(post => {
      const postDate = post.timestamp?.toDate();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return postDate > thirtyDaysAgo;
    }).length;

    return {
      totalContacts,
      pendingContacts,
      totalScholarships,
      pendingScholarships,
      totalBlogPosts,
      recentBlogPosts
    };
  };

  if (!user?.role?.startsWith('admin-')) {
    return <div className="p-4 text-red-600">You do not have permission to access this page.</div>;
  }

  if (loading) return <div className="p-4">Loading analytics...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  const overviewStats = getOverviewStats();

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[rgb(130,88,18)]">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded ${
              activeTab === 'overview' 
                ? 'bg-[rgb(130,88,18)] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded ${
              activeTab === 'contacts' 
                ? 'bg-[rgb(130,88,18)] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Contacts
          </button>
          <button
            onClick={() => setActiveTab('scholarships')}
            className={`px-4 py-2 rounded ${
              activeTab === 'scholarships' 
                ? 'bg-[rgb(130,88,18)] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Scholarships
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`px-4 py-2 rounded ${
              activeTab === 'blog' 
                ? 'bg-[rgb(130,88,18)] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Blog
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Overview Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Contact Submissions</h3>
              <p className="text-2xl font-bold text-[rgb(130,88,18)]">{overviewStats.totalContacts}</p>
              <p className="text-sm text-gray-600">{overviewStats.pendingContacts} pending</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Scholarship Applications</h3>
              <p className="text-2xl font-bold text-[rgb(130,88,18)]">{overviewStats.totalScholarships}</p>
              <p className="text-sm text-gray-600">{overviewStats.pendingScholarships} pending</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Blog Posts</h3>
              <p className="text-2xl font-bold text-[rgb(130,88,18)]">{overviewStats.totalBlogPosts}</p>
              <p className="text-sm text-gray-600">{overviewStats.recentBlogPosts} in last 30 days</p>
            </div>
          </div>

          {/* Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-[rgb(130,88,18)] mb-4">Contact Status Distribution</h3>
              <div style={{ height: '300px' }}>
                <Doughnut 
                  data={getContactStatusDistribution()} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} 
                />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-[rgb(130,88,18)] mb-4">Scholarship Status Distribution</h3>
              <div style={{ height: '300px' }}>
                <Doughnut 
                  data={getScholarshipStatusDistribution()} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-[rgb(130,88,18)] mb-4">Contact Submission Trends</h3>
              <div style={{ height: '300px' }}>
                <Line 
                  data={getContactSubmissionTrends()} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }} 
                />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-[rgb(130,88,18)] mb-4">Contact Status Distribution</h3>
              <div style={{ height: '300px' }}>
                <Pie 
                  data={getContactStatusDistribution()} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scholarships' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-[rgb(130,88,18)] mb-4">Scholarship Application Trends</h3>
              <div style={{ height: '300px' }}>
                <Line 
                  data={getScholarshipApplicationTrends()} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }} 
                />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-[rgb(130,88,18)] mb-4">Scholarship Status Distribution</h3>
              <div style={{ height: '300px' }}>
                <Pie 
                  data={getScholarshipStatusDistribution()} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'blog' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-[rgb(130,88,18)] mb-4">Blog Post Trends</h3>
              <div style={{ height: '300px' }}>
                <Line 
                  data={getBlogPostTrends()} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }} 
                />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-[rgb(130,88,18)] mb-4">Blog Posts by Category</h3>
              <div style={{ height: '300px' }}>
                <Pie 
                  data={getBlogPostStats()} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;