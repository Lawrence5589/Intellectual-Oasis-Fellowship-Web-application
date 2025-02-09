import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import UserManagement from './UserManagement';
import CourseManagement from './CourseManagement';
import QuizManagement from './QuizManagement';
import Analytics from './Analytics';
import AnnouncementsManager from './AnnouncementsManager';
import Reports from './Reports';

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar open={sidebarOpen} toggleSidebar={handleSidebarToggle} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
          <button onClick={handleSidebarToggle} className="text-2xl text-gray-700 hover:text-gray-600">
            &#9776; {/* Hamburger icon */}
          </button>
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        </header>
        <main className="p-6 space-y-8">
          <UserManagement />
          <CourseManagement />
          <QuizManagement />
          <Analytics />
          <AnnouncementsManager />
          <Reports />
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;