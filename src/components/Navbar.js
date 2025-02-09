import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Use the auth hook
import UserProfileIcon from './UserProfileIcon'; // A simple placeholder for user profile icon

function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="bg-white p-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src="/images/Group 4.jpg" className="h-10 sm:h-12 w-auto" alt="IOF Logo" />
          </Link>
        </div>
        <div className="flex items-center space-x-6">
          {user ? (
            <UserProfileIcon /> // Replace with actual user profile component or logic
          ) : (
            <>
              <div className="hidden md:flex space-x-8">
                <a href="#courses" className="hover:text-iof-light transition-colors duration-300">Courses</a>
                <a href="#about" className="hover:text-iof-light transition-colors duration-300">About</a>
                <a href="#contact" className="hover:text-iof-light transition-colors duration-300">Contact</a>
              </div>
              <Link to="/login" className="bg-iof-light text-white px-4 py-2 rounded hover:bg-iof-dark transition-colors duration-300 hidden md:block">Log in</Link>
              <Link to="/signup" className="bg-iof text-white px-4 py-2 rounded hover:bg-iof-dark transition-colors duration-300 hidden md:block">Start Learning</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;