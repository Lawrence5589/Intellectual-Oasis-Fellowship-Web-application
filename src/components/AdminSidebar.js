import React from 'react';

function AdminSidebar({ open, toggleSidebar }) {
  return (
    <div className={`fixed inset-y-0 left-0 bg-white shadow-xl z-30 transform ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
      <nav className="flex flex-col space-y-4 p-4 h-full">
        <button onClick={toggleSidebar} className="self-end text-xl">&times;</button>
        <a href="#user-management" className="text-lg hover:text-iof">User Management</a>
        <a href="#course-management" className="text-lg hover:text-iof">Course Management</a>
        <a href="#analytics" className="text-lg hover:text-iof">Analytics</a>
        <a href="#announcements" className="text-lg hover:text-iof">Announcements</a>
        <a href="#reports" className="text-lg hover:text-iof">Reports</a>
        <div className="mt-auto">
          <button className="w-full bg-iof text-white py-2 px-4 rounded hover:bg-iof-light-700 transition-colors">
            Sign Out
          </button>
        </div>
      </nav>
    </div>
  );
}

export default AdminSidebar;