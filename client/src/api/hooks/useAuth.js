import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../endpoints/auth';
import { authService } from '../../services/authService';

/**
 * React Query key factory for auth
 */
export const authKeys = {
  all: ['auth'],
  user: () => [...authKeys.all, 'user'],
  validate: () => [...authKeys.all, 'validate'],
};

/**
 * Hook to login a user
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Store token in authService
      if (data.token) {
        authService.setToken(data.token);
      }
      // Update user data in query cache
      queryClient.setQueryData(authKeys.user(), data.user);
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

/**
 * Hook to register a new user
 */
export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Store token in authService if registration also logs in the user
      if (data.token) {
        authService.setToken(data.token);
      }
      // Update user data in query cache
      if (data.user) {
        queryClient.setQueryData(authKeys.user(), data.user);
      }
    },
  });
};

/**
 * Hook to validate the current authentication token
 */
export const useValidateToken = (options = {}) => {
  return useQuery({
    queryKey: authKeys.validate(),
    queryFn: authApi.validateToken,
    retry: false,
    // Only run this query if there's a token
    enabled: !!authService.getToken(),
    ...options,
    onError: (error) => {
      // If the token is invalid, remove it
      if (error.response?.status === 401) {
        authService.logout();
      }
      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Hook to request a password reset
 */
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (email) => authApi.requestPasswordReset(email),
  });
};

/**
 * Hook to validate a reset token
 */
export const useValidateResetToken = (token) => {
  return useQuery({
    queryKey: ['passwordReset', 'validate', token],
    queryFn: () => authApi.validateResetToken(token),
    enabled: !!token,
    retry: false,
  });
};

/**
 * Hook to reset a password using a token
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
};

/**
 * Hook to logout the current user
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  const logout = () => {
    // Clear the token
    authService.logout();
    
    // Clear user data from cache
    queryClient.setQueryData(authKeys.user(), null);
    
    // Invalidate all auth queries to trigger refetches
    queryClient.invalidateQueries({ queryKey: authKeys.all });
    
    return true;
  };
  
  return { logout };
};

/**
 * Hook for OAuth2 login
 */
export const useOAuthLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ provider, code }) => authApi.oauthLogin(provider, code),
    onSuccess: (data) => {
      // Store token in authService
      if (data.token) {
        authService.setToken(data.token);
      }
      
      // Update user data in query cache
      if (data.user) {
        queryClient.setQueryData(authKeys.user(), data.user);
      }
      
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};