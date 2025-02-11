import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/contexts/AuthContext';
import './App.css';

// Layout components
import Navbar from './components/layout/Navbar';

// Auth components
import SignUp from './components/auth/SignUp';
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';

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

function App() {
  const location = useLocation();

  // Determine if the navbar should be shown
  const showNavbar = location.pathname !== '/login' && location.pathname !== '/signup';
  return (
    <AuthProvider>
      <div className="App">
        {showNavbar && <Navbar />}
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;