import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin, useLogout, useValidateToken } from '../api/hooks/useAuth';
import { authService } from '../services/authService';

// Create the auth context
const AuthContext = createContext(null);

/**
 * Provider component for authentication context
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  
  // Use our React Query hooks
  const { 
    data: userData,
    isLoading: isValidating,
    isError: isValidationError
  } = useValidateToken({
    onError: () => {
      // Clear any existing auth data on validation error
      authService.logout();
    }
  });

  const login = useLogin();
  const { logout } = useLogout();

  // Handle user login
  const handleLogin = async (credentials) => {
    try {
      const result = await login.mutateAsync(credentials);
      return { success: true, data: result };
    } catch (error) {
      console.error('Login error:', error);
      
      // Format the error response
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        'Failed to login. Please try again.';
        
      return { 
        success: false, 
        error: errorMessage,
        status: error.response?.status
      };
    }
  };

  // Handle user logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Provide auth context value
  const contextValue = {
    user: userData,
    isAuthenticated: !!userData && !!authService.getToken(),
    isLoading: isValidating,
    isError: isValidationError,
    login: handleLogin,
    logout: handleLogout,
    loginMutation: login
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};