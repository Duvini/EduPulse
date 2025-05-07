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
  
  // Return external URLs as-is
  if (url.startsWith('http')) return url;
  
  // Handle blob-based media URLs
  if (url.startsWith('blob:')) {
    // Extract the media ID
    const mediaId = url.substring(5); // Remove 'blob:' prefix
    return `${BASE_URL}/api/v1/media-blob/${mediaId}`;
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
  
  return `${BASE_URL}${cleanUrl}`;
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
  async (error) => {
    // Don't process errors for requests that are still retrying
    if (error.config && error.config.__isRetryRequest) {
      return Promise.reject(error);
    }

    // Check if network error (offline)
    if (!error.response) {
      console.warn('Network error detected, application will continue with cached data');
      return Promise.reject(error);
    }

    // For 401 errors on learning plan endpoints, try to refresh token first
    if (error.response?.status === 401 && error.config?.url?.includes('/api/v1/plans')) {
      // If token refresh functionality is available
      try {
        // Check if a valid token exists first
        const currentToken = authService.getToken();
        if (!currentToken) {
          throw new Error('No token available');
        }
        
        // You can add token refresh logic here if available
        // For now, we'll just verify the current token is valid
        const validateResponse = await axios.post(
          `${BASE_URL}/api/auth/validate`, 
          {}, 
          { headers: { Authorization: `Bearer ${currentToken}` }}
        );
        
        if (validateResponse.status === 200) {
          // Token is still valid, but server rejected for other reasons
          // Retry the original request
          const originalRequest = error.config;
          originalRequest.__isRetryRequest = true;
          originalRequest.headers.Authorization = `Bearer ${currentToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error('Authentication validation failed:', refreshError);
        // Redirect to login if validation fails
        authService.logout();
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
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
          'User not found',
          'Authentication required',
          'Full authentication is required'
        ];
        
        // Check if error message is a specific auth error
        const isAuthError = specificAuthErrors.some(msg => 
          error.response.data?.message?.includes(msg) || 
          error.response.data?.error?.includes(msg) ||
          (typeof error.response.data === 'string' && error.response.data.includes(msg))
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