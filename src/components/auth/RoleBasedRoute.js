import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from '../common/LoadingIndicator';

const ADMIN_ROLES = {
  'admin-master': ['*'], // Access to all routes
  'admin-content_manager': ['blog'],
  'admin-smecourse_manager': ['courses', 'quizzes'],
  'admin-support_manager': ['contact'],
  'admin-scholarship_manager': ['scholarships']
};

const RoleBasedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role;
  
  // Check if user has access to the required role
  const hasAccess = () => {
    if (!userRole) return false;
    
    // Admin master has access to everything
    if (userRole === 'admin-master') return true;
    
    // Check if the user's role has access to the required role
    const allowedRoutes = ADMIN_ROLES[userRole];
    if (!allowedRoutes) return false;
    
    // Check if the route is allowed for this role
    return allowedRoutes.includes(requiredRole) || allowedRoutes.includes('*');
  };

  if (!hasAccess()) {
    return (
      <div className="p-4 text-red-600">
        Access denied. You don't have permission to access this page.
      </div>
    );
  }

  return children;
};

export default RoleBasedRoute; 