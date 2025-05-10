import axios from 'axios';
import { authService } from './authService';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Validate request body for POST/PUT requests
      if ((config.method === 'post' || config.method === 'put') && config.data) {
        if (!(config.data instanceof FormData)) {
          try {
            JSON.stringify(config.data);
          } catch {
            return Promise.reject(new Error('Invalid request format'));
          }
        }
      }

      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Don't process errors for requests that are still retrying
    if (error.config && error.config.__isRetryRequest) {
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      console.warn('Network error:', error.message);
      return Promise.reject({
        response: {
          data: {
            error: true,
            message: 'Network error: Please check your connection'
          }
        }
      });
    }

    // Handle different error status codes
    switch (error.response.status) {
      case 400:
        // Bad Request - Validation errors
        console.error('Validation error:', error.response.data);
        return Promise.reject({
          response: {
            status: 400,
            data: {
              error: true,
              message: error.response.data?.message || 'Invalid request format'
            }
          }
        });

      case 401:
        // Only handle auth errors for non-validation endpoints
        if (!error.config.url.includes('/api/auth/validate')) {
          const message = error.response.data?.message || 'Authentication required';
          
          // Only logout for specific auth errors
          if (message.includes('invalid token') || 
              message.includes('token expired') || 
              message.includes('authentication failed')) {
            authService.logout();
            window.location.href = '/signin';
          }
        }
        break;

      case 403:
        console.error('Forbidden:', error.response.data);
        return Promise.reject({
          response: {
            status: 403,
            data: {
              error: true,
              message: 'You do not have permission to perform this action'
            }
          }
        });

      case 404:
        console.error('Not found:', error.response.data);
        return Promise.reject({
          response: {
            status: 404,
            data: {
              error: true,
              message: error.response.data?.message || 'Resource not found'
            }
          }
        });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;