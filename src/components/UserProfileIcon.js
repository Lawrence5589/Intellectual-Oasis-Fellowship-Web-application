import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Import your authentication context

function UserProfileIcon() {
  const { user } = useAuth(); // Assuming user object has a displayName property
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/dashboard'); // Navigate to the dashboard
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleProfileClick}
        className="text-iof bg-gray-200 p-2 rounded-full hover:bg-gray-300"
        aria-label="User Profile"
      >
        👤 {/* Placeholder for profile avatar or icon */}
      </button>
      <span className="text-gray-700 font-medium">{user?.displayName || 'User'}</span>
    </div>
  );
}

export default UserProfileIcon;