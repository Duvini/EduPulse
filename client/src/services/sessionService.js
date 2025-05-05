import { authService } from './authService';

export const sessionService = {
  /**
   * Initialize session management
   * This should be called when the application starts
   */
  initializeSession: () => {
    // Set up storage event listener to sync authentication across tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'token' && !event.newValue) {
        // Token was removed in another tab, logout in this tab too
        window.location.reload();
      }
    });

    // Set up beforeunload handler to ensure session persistence
    window.addEventListener('beforeunload', () => {
      // Make sure current session data is saved before page refresh
      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();
      
      if (currentUser && token) {
        // Ensure latest user data is persisted in storage
        try {
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (e) {
          console.error('Error persisting session before unload:', e);
        }
      }
    });
  },
  
  /**
   * Validates and restores session on page load
   * @returns {Promise<Object>} Session information
   */
  restoreSession: async () => {
    const token = authService.getToken();
    const currentUser = authService.getCurrentUser();
    
    if (!token || !currentUser) {
      return { valid: false, user: null };
    }
    
    try {
      // Only call validate if we have network connectivity
      if (navigator.onLine) {
        const response = await authService.validateToken();
        if (!response.error) {
          // Session is valid
          return { valid: true, user: response.data };
        }
        
        // Only consider the session invalid for specific auth errors
        if (response.data === 'Token validation failed' || 
            response.data === 'No token found' ||
            response.data === 'Invalid user data') {
          return { valid: false, user: null };
        }
      }
      
      // For offline mode or non-fatal errors, keep using the existing session
      return { valid: true, user: currentUser };
    } catch (error) {
      console.error('Error restoring session:', error);
      // On error, assume the current session is still valid
      return { valid: true, user: currentUser };
    }
  }
};