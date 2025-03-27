import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from '../common/LoadingIndicator';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has any admin role
  const isAdmin = user.role && user.role.startsWith('admin-');

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
};

export default AdminRoute;