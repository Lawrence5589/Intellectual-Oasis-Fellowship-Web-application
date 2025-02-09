import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

function Sidebar({ open, toggleSidebar }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Optionally handle post-sign-out actions
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className={`fixed inset-y-0 left-0 bg-white shadow-xl z-30 transform ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
      <nav className="flex flex-col space-y-4 p-4 h-full">
        <button onClick={toggleSidebar} className="self-end text-xl">&times;</button>
        <a href="#available-courses" className="text-lg hover:text-iof">Available Courses</a>
        <a href="#enrolled-courses" className="text-lg hover:text-iof">Enrolled Courses</a>
        <a href="#quiz-section" className="text-lg hover:text-iof">Quiz Section</a>
        <a href="#leaderboard" className="text-lg hover:text-iof">Leaderboard</a>
        <a href="#announcements" className="text-lg hover:text-iof">Announcements</a>
        <div className="mt-auto">
          <button onClick={handleSignOut} className="w-full bg-iof text-white py-2 px-4 rounded hover:bg-iof-light transition-colors">
            Sign Out
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;