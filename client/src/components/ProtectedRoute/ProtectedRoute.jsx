import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../../../store';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;