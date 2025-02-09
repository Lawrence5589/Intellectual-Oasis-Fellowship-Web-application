import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import SignUp from './components/SignUp';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import Dashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard'; // Import AdminDashboard
import PrivateRoute from './components/PrivateRoute'; // Ensure PrivateRoute exists
import CoursePage from './components/CoursePage';
import CourseContent from './components/CourseContent';
import './App.css';

function App() {
  return (
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
      </Routes>
    </div>
  );
}

export default App;