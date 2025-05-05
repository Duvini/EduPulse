import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home/Home';
import SignIn from '../pages/Auth/SignIn';
import SignUp from '../pages/Auth/SignUp';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import UserProfile from '../pages/Profile/UserProfile';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* Protected Routes */}
      <Route path="/feed" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } />
      
      {/* Add other protected routes here */}
      <Route path="/learn" element={
        <ProtectedRoute>
          <div>Learn Page (Coming Soon)</div>
        </ProtectedRoute>
      } />
      <Route path="/friends" element={
        <ProtectedRoute>
          <div>Friends Page (Coming Soon)</div>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <div>Notifications Page (Coming Soon)</div>
        </ProtectedRoute>
      } />
      <Route path="/subscription" element={
        <ProtectedRoute>
          <div>Subscription Page (Coming Soon)</div>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <div>Settings Page (Coming Soon)</div>
        </ProtectedRoute>
      } />
      <Route path="/help" element={
        <ProtectedRoute>
          <div>Help & Support Page (Coming Soon)</div>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;