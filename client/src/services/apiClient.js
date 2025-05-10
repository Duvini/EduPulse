import axios from 'axios';
import { authService } from './authService';
import { showErrorToast } from '../utils/toastUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
  (response) => {
    // Check for API responses with error:true format
    if (response.data && response.data.error === true) {
      // Display error toast for API responses with error:true
      showErrorToast(response.data.message || 'An unexpected error occurred');
      // Still return the response so components can handle it themselves if needed
    }
    return response;
  },
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

// Utility function to get full media URL
export const getMediaUrl = (url) => {
  if (!url) return null;
  
  // Return external URLs as-is
  if (url.startsWith('http')) return url;
  
  // Handle blob-based media URLs
  if (url.startsWith('blob:')) {
    // Extract the media ID
    const mediaId = url.substring(5); // Remove 'blob:' prefix
    return `${API_BASE_URL}/api/v1/media-blob/${mediaId}`;
  }
  
  // Handle legacy filesystem-based URLs
  // Clean up the URL path to ensure it works consistently
  let cleanUrl = url;
  
  // If the URL has multiple forward slashes, normalize them
  cleanUrl = cleanUrl.replace(/\/+/g, '/');
  
  // Ensure URL starts with a single forward slash
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }
  
  return `${API_BASE_URL}${cleanUrl}`;
};

export default apiClient;