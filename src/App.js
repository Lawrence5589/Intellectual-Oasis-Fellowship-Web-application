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
import BlogManagement from './components/admin/BlogManagement';
import AdminRoute from './components/auth/AdminRoute';
import ContactManagement from './components/admin/ContactManagement';
import DonationManagement from './components/admin/DonationManagement';

// Landing components
import LandingPage from './components/landing/LandingPage';

// Dashboard components
import Dashboard from './components/dashboard/UserDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

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
import ScholarshipManagement from './components/admin/ScholarshipManagement';
import MyApplications from './components/scholarships/MyApplications';

// Common components
import NotFound from './components/common/NotFound';
import ApplicationSuccess from './components/scholarships/ApplicationSuccess';

// New page components
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
  const showNavbar = !isAuthPage;
  const showFooter = !isAuthPage; // Show footer on all pages except auth pages

  return (
    <HelmetProvider>
      <Helmet>
        <title>Intellectual Oasis Fellowship</title>
      </Helmet>
      <AuthProvider>
        <ScrollToTop />
        <div className="App min-h-screen flex flex-col">
          {showNavbar && <Navbar />}
          <main className={`flex-grow ${!isLandingPage ? 'mt-20' : ''}`}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/courses" element={
                <PrivateRoute>
                  <CoursePage />
                </PrivateRoute>
              } />
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/courses/:courseId" element={
                <PrivateRoute>
                  <CourseContent />
                </PrivateRoute>
              } />
              <Route path="/courses/:courseId/module/:moduleIndex/subcourse/:subCourseIndex" element={
                <PrivateRoute>
                  <CoursePresentation />
                </PrivateRoute>
              } />
              <Route path="/courses/:courseId/exam" element={
                <PrivateRoute>
                  <ExamPage />
                </PrivateRoute>
              } />
              <Route path="/courses/:courseId/results" element={
                <PrivateRoute>
                  <ResultsPage />
                </PrivateRoute>
              } />
              <Route path="/verify" element={<VerifyCertificate />} />
              <Route
                path="/courses/:courseId/certificate"
                element={
                  <PrivateRoute>
                    <Certificate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/:courseId/content/:moduleTitle/:subCourseId"
                element={
                  <PrivateRoute>
                    <CoursePresentation />
                  </PrivateRoute>
                }
              />
              <Route path="/public-quiz/:quizId" element={<PublicQuizEntry />} />
              <Route
                path="/take-quiz/:quizId"
                element={
                  <PrivateRoute>
                    <Quiz />
                  </PrivateRoute>
                }
              />
              <Route path="/quiz-results/:quizId" element={
                <PrivateRoute>
                  <QuizResults />
                </PrivateRoute>
              } />
              <Route
                path="/profile-settings"
                element={
                  <PrivateRoute>
                    <ProfileSettings />
                  </PrivateRoute>
                }
              />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:postId" element={<BlogPost />} />
              <Route path="/admin/blog" element={
                <AdminRoute>
                  <BlogManagement />
                </AdminRoute>
              } />
              {/* Scholarship Routes */}
              <Route path="/scholarships" element={<ScholarshipPage />} />
              <Route path="/scholarships/:scholarshipId/apply" element={
                <PrivateRoute>
                  <ScholarshipApplication />
                </PrivateRoute>
              } />
              <Route path="/scholarships/my-applications" element={
                <PrivateRoute>
                  <MyApplications />
                </PrivateRoute>
              } />
              <Route path="/scholarships/application-success" element={
                <PrivateRoute>
                  <ApplicationSuccess />
                </PrivateRoute>
              } />
              <Route path="/admin/scholarships" element={
                <AdminRoute>
                  <ScholarshipManagement />
                </AdminRoute>
              } />
              <Route path="/admin/contact" element={
                <AdminRoute>
                  <ContactManagement />
                </AdminRoute>
              } />
              <Route path="/admin/donations" element={
                <AdminRoute>
                  <DonationManagement />
                </AdminRoute>
              } />
              <Route path="/donate" element={<Donate />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/support" element={<Support />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />
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