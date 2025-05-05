import axios from 'axios';
import { authService } from './authService';

const BASE_URL = 'http://localhost:8080';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Utility function to get full media URL
export const getMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Always get fresh token from storage before each request
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't process errors for requests that are still retrying
    if (error.config && error.config.__isRetryRequest) {
      return Promise.reject(error);
    }

    // Check if network error (offline)
    if (!error.response) {
      console.warn('Network error detected, application will continue with cached data');
      return Promise.reject(error);
    }

    const isValidateEndpoint = error.config?.url?.includes('/api/auth/validate');
    
    if (error.response?.status === 401 && !isValidateEndpoint) {
      // Check if we should really log out or just show an error
      const isProfilePage = window.location.pathname.includes('/profile');
      
      // Be more selective about when to logout
      if (!isProfilePage) {
        // Only logout for true authentication errors, not network issues
        const specificAuthErrors = [
          'Invalid token',
          'Token expired', 
          'Token validation failed',
          'User not found'
        ];
        
        // Check if error message is a specific auth error
        const isAuthError = specificAuthErrors.some(msg => 
          error.response.data?.message?.includes(msg) || 
          error.response.data?.error?.includes(msg)
        );
        
        if (isAuthError) {
          // Only logout for specific authentication errors
          authService.logout();
          window.location.href = '/signin';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;