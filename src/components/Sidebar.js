import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Link, useNavigate } from 'react-router-dom';

function Sidebar({ open, toggleSidebar }) {
  const navigate = useNavigate();
  const [quizDropdownOpen, setQuizDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className={`fixed inset-y-0 left-0 bg-white shadow-xl z-30 transform ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out w-64`}>
      <nav className="flex flex-col h-full overflow-y-auto">
        {/* Close button */}
        <button 
          onClick={toggleSidebar} 
          className="self-end p-4 text-xl hover:text-iof"
          aria-label="Close sidebar"
        >
          &times;
        </button>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-2 space-y-2">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-iof transition-colors"
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </Link>

          <Link 
            to="/courses" 
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-iof transition-colors"
          >
            <span>📚</span>
            <span>My Courses</span>
          </Link>

          {/* Quizzes & Tests Dropdown */}
          <div>
            <button 
              onClick={() => setQuizDropdownOpen(!quizDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-iof transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span>✍️</span>
                <span>Quizzes & Tests</span>
              </div>
              <span className={`transform transition-transform ${quizDropdownOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {quizDropdownOpen && (
              <div className="ml-8 mt-2 space-y-2">
                <Link 
                  to="/practice-quizzes"
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-iof transition-colors"
                >
                  <span>🎯</span>
                  <span>Practice Quizzes</span>
                </Link>
                <Link 
                  to="/my-tests"
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-iof transition-colors"
                >
                  <span>📝</span>
                  <span>My Tests</span>
                </Link>
              </div>
            )}
          </div>

          <Link 
            to="/certificates" 
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-iof transition-colors"
          >
            <span>🏆</span>
            <span>Certifications</span>
          </Link>

          <Link 
            to="/courses" 
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-iof transition-colors"
          >
            <span>📖</span>
            <span>Course Repository</span>
          </Link>

          <Link 
            to="/resources" 
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-iof transition-colors"
          >
            <span>📌</span>
            <span>Resources</span>
          </Link>

          <Link 
            to="/forums" 
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-iof transition-colors"
          >
            <span>💭</span>
            <span>Discussion Forums</span>
          </Link>

          <Link 
            to="/settings" 
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-iof transition-colors"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </Link>
        </div>

        {/* Sign Out Button */}
        <div className="p-4 border-t">
          <button 
            onClick={handleSignOut} 
            className="w-full flex items-center justify-center space-x-2 bg-iof text-white py-2 px-4 rounded-lg hover:bg-iof-dark transition-colors"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;