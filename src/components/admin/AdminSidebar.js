import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAVIGATION_ITEMS = [
  { id: 'users', label: 'User Management', icon: '👥', roles: ['admin-master'] },
  { id: 'progress', label: 'User Progress', icon: '📊', roles: ['admin-master'] },
  { id: 'courses', label: 'Course Management', icon: '📚', roles: ['admin-master', 'admin-smecourse_manager'] },
  { id: 'quizzes', label: 'Quiz Management', icon: '✍️', roles: ['admin-master', 'admin-smecourse_manager'] },
  { id: 'blog', label: 'Blog Management', icon: '📝', roles: ['admin-master', 'admin-content_manager'] },
  { id: 'scholarships', label: 'Scholarship Management', icon: '🎓', roles: ['admin-master', 'admin-scholarship_manager'] },
  { id: 'contact', label: 'Contact Management', icon: '📧', roles: ['admin-master', 'admin-support_manager'] },
  { id: 'donations', label: 'Donation Management', icon: '💰', roles: ['admin-master'] },
  { id: 'announcements', label: 'Announcements', icon: '📢', roles: ['admin-master'] },
  { id: 'analytics', label: 'Analytics', icon: '📈', roles: ['admin-master'] },
  { id: 'reports', label: 'Reports', icon: '📋', roles: ['admin-master'] }
];

const AdminSidebar = ({ open, toggleSidebar, activeComponent, setActiveComponent }) => {
  const location = useLocation();
  const { user } = useAuth();

  const handleNavClick = (component) => {
    setActiveComponent(component);
  };

  // Filter navigation items based on user's role
  const filteredNavItems = NAVIGATION_ITEMS.filter(item => {
    if (!user?.role) return false;
    return item.roles.includes(user.role);
  });

  return (
    <aside 
      className={`fixed inset-y-0 left-0 bg-[rgb(130,88,18)] text-white transform transition-all duration-200 ease-in-out z-30 
        ${open ? 'w-64' : 'w-16'} overflow-y-auto`}
      role="navigation"
      aria-label="Admin navigation"
    >
      <div className="sticky top-0 bg-[rgb(130,88,18)] p-4 border-b border-[rgb(110,68,0)]">
        <h2 className={`text-xl font-bold mb-2 flex items-center gap-2 ${!open && 'justify-center'}`}>
          <span role="img" aria-label="admin">👑</span>
          {open && 'Admin Panel'}
        </h2>
        {open && (
          <p className="text-sm text-gray-200">
            {user?.role?.replace('admin-', '').replace('_', ' ').toUpperCase()}
          </p>
        )}
      </div>
      
      <nav className="p-4 space-y-2">
        {filteredNavItems.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => handleNavClick(id)}
            className={`w-full text-left rounded-md transition-colors duration-200 flex items-center gap-2
              ${open ? 'px-4 py-2' : 'justify-center p-2'}
              ${activeComponent === id 
                ? 'bg-[rgb(110,68,0)]' 
                : 'hover:bg-[rgb(110,68,0)]'
              }`}
            aria-current={activeComponent === id ? 'page' : undefined}
            title={!open ? label : undefined}
          >
            <span role="img" aria-hidden="true" className="flex-shrink-0">{icon}</span>
            {open && <span className="truncate">{label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;