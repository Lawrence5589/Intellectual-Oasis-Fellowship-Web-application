import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import SignUp from './components/SignUp';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import Dashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import CoursePage from './components/CoursePage';
import CourseContent from './components/CourseContent';
import CoursePresentation from './components/CoursePresentation';
import ExamPage from './components/ExamPage';
import ResultsPage from './components/ResultsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import VerifyCertificate from './components/VerifyCertificate';
import Certificate from './components/Certificate';
import NotFound from './components/NotFound';
import Quiz from './components/quiz/Quiz';
import PublicQuizEntry from './components/quiz/PublicQuizEntry';
import QuizResults from './components/quiz/QuizResults';
import './App.css';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }/>
          <Route path="/courses" element={<CoursePage />} />
          <Route path="/admin" element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }/>
          <Route path="/courses/:courseId" element={<CourseContent />} />
          <Route path="/courses/:courseId/module/:moduleIndex/subcourse/:subCourseIndex" element={<CoursePresentation />} />
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
            element={<CoursePresentation />} 
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