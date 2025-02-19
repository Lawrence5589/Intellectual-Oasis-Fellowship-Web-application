import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { AuthProvider, useAuth } from './components/contexts/AuthContext';
import './App.css';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Auth components
import SignUp from './components/auth/SignUp';
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';
import ProfileSettings from './components/auth/ProfileSettings';
import BlogPage from './components/blog/BlogPage';
import BlogPost from './components/blog/BlogPost';
import BlogManagement from './components/admin/BlogManagement';


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

// Common components
import NotFound from './components/common/NotFound';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Add the new component
function App() {
  const location = useLocation();
  
  // Updated logic for navbar and footer visibility
  const isLandingPage = location.pathname === '/';
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);
  const showNavbar = !isAuthPage;
  const showFooter = location.pathname === '/';

  return (
    <HelmetProvider>
      <Helmet>
        <title>Intellectual Oasis Fellowship</title>
      </Helmet>
      <AuthProvider>
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
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
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
              <Route 
                path="/admin/blog" 
                element={
                  <PrivateRoute>
                    <BlogManagement />
                  </PrivateRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {showFooter && <Footer />}
        </div>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;