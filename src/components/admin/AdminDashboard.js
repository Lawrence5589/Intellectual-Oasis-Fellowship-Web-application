import React, { useState, Suspense, lazy, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 rounded-lg">
          <h3 className="text-red-800 font-medium">Something went wrong</h3>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy load components
const UserManagement = lazy(() => import('./UserManagement'));
const UserProgress = lazy(() => import('./UserProgress'));
const CourseManagement = lazy(() => import('./CourseManagement'));
const QuizManagement = lazy(() => import('./QuizManagement'));
const BlogManagement = lazy(() => import('./BlogManagement'));
const ScholarshipManagement = lazy(() => import('./ScholarshipManagement'));
const ContactManagement = lazy(() => import('./ContactManagement'));
const DonationManagement = lazy(() => import('./DonationManagement'));
const Analytics = lazy(() => import('./Analytics'));
const AnnouncementsManager = lazy(() => import('./AnnouncementsManager'));
const Reports = lazy(() => import('./Reports'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(130,88,18)]"></div>
  </div>
);

// Mobile restriction message
const MobileRestrictionMessage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Desktop Only Access</h1>
      <p className="text-gray-600">
        The admin dashboard is only accessible on desktop devices for security and usability reasons.
        <br />Please use a desktop computer to access this area.
      </p>
    </div>
  </div>
);

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const activeComponent = location.pathname.split('/admin/')[1] || 'users';

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      if (isMobileDevice) {
        navigate('/');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [navigate]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleComponentChange = (component) => {
    navigate(`/admin/${component}`);
  };

  if (isMobile) {
    return <MobileRestrictionMessage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar 
        open={sidebarOpen} 
        toggleSidebar={handleSidebarToggle}
        activeComponent={activeComponent}
        setActiveComponent={handleComponentChange}
      />
      <div 
        className={`transition-all duration-200 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-16'}`}
      >
        <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSidebarToggle} 
              className="text-gray-700 hover:text-gray-600 flex items-center gap-2"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <span className="text-xl">{sidebarOpen ? '◀' : '▶'}</span>
              <span className="text-sm font-medium hidden sm:inline">
                {sidebarOpen ? 'Collapse' : 'Expand'}
              </span>
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {activeComponent.charAt(0).toUpperCase() + activeComponent.slice(1)} Management
            </h1>
          </div>
        </header>
        <main className="p-6">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;