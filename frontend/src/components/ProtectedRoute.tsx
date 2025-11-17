import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly = false }) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    // You might want to show a loader here
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && currentUser.role !== 'admin') {
    return <Navigate to="/generate" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
