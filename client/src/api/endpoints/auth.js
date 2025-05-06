import apiClient from '../../services/apiClient';

const API_URL = '/api/v1/auth';

/**
 * Authentication API endpoints
 */
export const authApi = {
  /**
   * Log in a user
   */
  login: async ({ email, password }) => {
    const response = await apiClient.post(`${API_URL}/login`, {
      email,
      password
    });
    return response.data;
  },

  /**
   * Register a new user
   */
  register: async (userData) => {
    const response = await apiClient.post(`${API_URL}/register`, userData);
    return response.data;
  },

  /**
   * Validate current auth token
   */
  validateToken: async () => {
    const response = await apiClient.get(`${API_URL}/validate`);
    return response.data;
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email) => {
    const response = await apiClient.post(`${API_URL}/password-reset/request`, { email });
    return response.data;
  },

  /**
   * Validate password reset token
   */
  validateResetToken: async (token) => {
    const response = await apiClient.get(`${API_URL}/password-reset/validate/${token}`);
    return response.data;
  },

  /**
   * Reset password using token
   */
  resetPassword: async ({ token, password }) => {
    const response = await apiClient.post(`${API_URL}/password-reset/reset`, { token, password });
    return response.data;
  },

  /**
   * OAuth2 login
   */
  oauthLogin: async (provider, code) => {
    const response = await apiClient.post(`${API_URL}/oauth/${provider}`, { code });
    return response.data;
  }
};