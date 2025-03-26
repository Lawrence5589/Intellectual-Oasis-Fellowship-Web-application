import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="bg-[rgb(130,88,18)] text-white w-64 min-h-screen p-4">
      <nav className="space-y-2">
        <Link
          to="/admin"
          className={`block px-4 py-2 rounded-md ${
            isActive('/admin') ? 'bg-[rgb(110,68,0)]' : 'hover:bg-[rgb(110,68,0)]'
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/admin/courses"
          className={`block px-4 py-2 rounded-md ${
            isActive('/admin/courses') ? 'bg-[rgb(110,68,0)]' : 'hover:bg-[rgb(110,68,0)]'
          }`}
        >
          Course Management
        </Link>
        <Link
          to="/admin/users"
          className={`block px-4 py-2 rounded-md ${
            isActive('/admin/users') ? 'bg-[rgb(110,68,0)]' : 'hover:bg-[rgb(110,68,0)]'
          }`}
        >
          User Management
        </Link>
        <Link
          to="/admin/blog"
          className={`block px-4 py-2 rounded-md ${
            isActive('/admin/blog') ? 'bg-[rgb(110,68,0)]' : 'hover:bg-[rgb(110,68,0)]'
          }`}
        >
          Blog Management
        </Link>
        <Link
          to="/admin/scholarships"
          className={`block px-4 py-2 rounded-md ${
            isActive('/admin/scholarships') ? 'bg-[rgb(110,68,0)]' : 'hover:bg-[rgb(110,68,0)]'
          }`}
        >
          Scholarship Management
        </Link>
        <Link
          to="/admin/contact"
          className={`block px-4 py-2 rounded-md ${
            isActive('/admin/contact') ? 'bg-[rgb(110,68,0)]' : 'hover:bg-[rgb(110,68,0)]'
          }`}
        >
          Contact Management
        </Link>
        <Link
          to="/admin/donations"
          className={`block px-4 py-2 rounded-md ${
            isActive('/admin/donations') ? 'bg-[rgb(110,68,0)]' : 'hover:bg-[rgb(110,68,0)]'
          }`}
        >
          Donation Management
        </Link>
        <Link
          to="/admin/announcements"
          className={`block px-4 py-2 rounded-md ${
            isActive('/admin/announcements') ? 'bg-[rgb(110,68,0)]' : 'hover:bg-[rgb(110,68,0)]'
          }`}
        >
          Announcements
        </Link>
        <Link
          to="/admin/analytics"
          className={`block px-4 py-2 rounded-md ${
            isActive('/admin/analytics') ? 'bg-[rgb(110,68,0)]' : 'hover:bg-[rgb(110,68,0)]'
          }`}
        >
          Analytics
        </Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;