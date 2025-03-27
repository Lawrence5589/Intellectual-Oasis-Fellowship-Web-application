import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { AuthProvider, useAuth } from './components/contexts/AuthContext';
import './App.css';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import CookieConsent from './components/CookieConsent';

// Auth components
import SignUp from './components/auth/SignUp';
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';
import ProfileSettings from './components/auth/ProfileSettings';
import BlogPage from './components/blog/BlogPage';
import BlogPost from './components/blog/BlogPost';
import AdminRoute from './components/auth/AdminRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';

// Admin components
import AdminDashboard from './components/admin/AdminDashboard';
import BlogManagement from './components/admin/BlogManagement';
import ContactManagement from './components/admin/ContactManagement';
import DonationManagement from './components/admin/DonationManagement';
import ScholarshipManagement from './components/admin/ScholarshipManagement';
import UserManagement from './components/admin/UserManagement';
import UserProgress from './components/admin/UserProgress';
import CourseManagement from './components/admin/CourseManagement';
import QuizManagement from './components/admin/QuizManagement';
import Analytics from './components/admin/Analytics';
import AnnouncementsManager from './components/admin/AnnouncementsManager';
import Reports from './components/admin/Reports';

// Landing components
import LandingPage from './components/landing/LandingPage';

// Dashboard components
import Dashboard from './components/dashboard/UserDashboard';

// Course components
import CoursePage from './components/courses/CoursePage';
import CourseContent from './components/courses/CourseContent';
import CoursePresentation from './components/courses/CoursePresentation';
import Certificate from './components/courses/Certificate';
import VerifyCertificate from './components/courses/VerifyCertificate';

// Exam components
import ExamPage from './components/courses/ExamPage';
import ResultsPage from './components/courses/ResultsPage';

// Quiz components
import Quiz from './components/quiz/Quiz';
import PublicQuizEntry from './components/quiz/PublicQuizEntry';
import QuizResults from './components/quiz/QuizResults';

// Scholarship components
import ScholarshipPage from './components/scholarships/ScholarshipPage';
import ScholarshipApplication from './components/scholarships/ScholarshipApplication';
import MyApplications from './components/scholarships/MyApplications';

// Common components
import NotFound from './components/common/NotFound';
import ApplicationSuccess from './components/scholarships/ApplicationSuccess';

// Page components
import Donate from './components/pages/Donate';
import About from './components/pages/About';
import FAQ from './components/pages/FAQ';
import Support from './components/pages/Support';
import Terms from './components/pages/Terms';
import Privacy from './components/pages/Privacy';
import Cookies from './components/pages/Cookies';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const location = useLocation();
  
  // Updated logic for navbar and footer visibility
  const isLandingPage = location.pathname === '/';
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const showNavbar = !isAuthPage && !isAdminPage;
  const showFooter = !isAuthPage && !isAdminPage;

  return (
    <HelmetProvider>
      <Helmet>
        <title>Intellectual Oasis Fellowship</title>
      </Helmet>
      <AuthProvider>
        <ScrollToTop />
        <div className="App min-h-screen flex flex-col">
          {showNavbar && <Navbar />}
          <main className={`flex-grow ${!isLandingPage && !isAdminPage ? 'mt-20' : ''}`}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:postId" element={<BlogPost />} />
              <Route path="/scholarships" element={<ScholarshipPage />} />
              <Route path="/public-quiz/:quizId" element={<PublicQuizEntry />} />
              <Route path="/verify" element={<VerifyCertificate />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/support" element={<Support />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/profile-settings" element={<PrivateRoute><ProfileSettings /></PrivateRoute>} />
              <Route path="/courses" element={<PrivateRoute><CoursePage /></PrivateRoute>} />
              <Route path="/courses/:courseId" element={<PrivateRoute><CourseContent /></PrivateRoute>} />
              <Route path="/courses/:courseId/module/:moduleIndex/subcourse/:subCourseIndex" element={<PrivateRoute><CoursePresentation /></PrivateRoute>} />
              <Route path="/courses/:courseId/exam" element={<PrivateRoute><ExamPage /></PrivateRoute>} />
              <Route path="/courses/:courseId/results" element={<PrivateRoute><ResultsPage /></PrivateRoute>} />
              <Route path="/courses/:courseId/certificate" element={<PrivateRoute><Certificate /></PrivateRoute>} />
              <Route path="/courses/:courseId/content/:moduleTitle/:subCourseId" element={<PrivateRoute><CoursePresentation /></PrivateRoute>} />
              <Route path="/take-quiz/:quizId" element={<PrivateRoute><Quiz /></PrivateRoute>} />
              <Route path="/quiz-results/:quizId" element={<PrivateRoute><QuizResults /></PrivateRoute>} />
              <Route path="/scholarships/:scholarshipId/apply" element={<PrivateRoute><ScholarshipApplication /></PrivateRoute>} />
              <Route path="/scholarships/my-applications" element={<PrivateRoute><MyApplications /></PrivateRoute>} />
              <Route path="/scholarships/application-success" element={<PrivateRoute><ApplicationSuccess /></PrivateRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
                <Route index element={<Navigate to="/admin/users" replace />} />
                <Route path="users" element={<RoleBasedRoute requiredRole="users"><UserManagement /></RoleBasedRoute>} />
                <Route path="progress" element={<RoleBasedRoute requiredRole="progress"><UserProgress /></RoleBasedRoute>} />
                <Route path="courses" element={<RoleBasedRoute requiredRole="courses"><CourseManagement /></RoleBasedRoute>} />
                <Route path="quizzes" element={<RoleBasedRoute requiredRole="quizzes"><QuizManagement /></RoleBasedRoute>} />
                <Route path="blog" element={<RoleBasedRoute requiredRole="blog"><BlogManagement /></RoleBasedRoute>} />
                <Route path="scholarships" element={<RoleBasedRoute requiredRole="scholarships"><ScholarshipManagement /></RoleBasedRoute>} />
                <Route path="contact" element={<RoleBasedRoute requiredRole="contact"><ContactManagement /></RoleBasedRoute>} />
                <Route path="donations" element={<RoleBasedRoute requiredRole="donations"><DonationManagement /></RoleBasedRoute>} />
                <Route path="announcements" element={<RoleBasedRoute requiredRole="announcements"><AnnouncementsManager /></RoleBasedRoute>} />
                <Route path="analytics" element={<RoleBasedRoute requiredRole="analytics"><Analytics /></RoleBasedRoute>} />
                <Route path="reports" element={<RoleBasedRoute requiredRole="reports"><Reports /></RoleBasedRoute>} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {showFooter && <Footer />}
          <CookieConsent />
        </div>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;