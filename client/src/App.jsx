import React, { useEffect } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import TopNavbar from './components/TopNavbar/TopNavbar';
import AppRoutes from './routes/routes';
import { useStore } from '../store';
import { authService } from './services/authService';
import { sessionService } from './services/sessionService';

// Configure React Router future flags
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
NavigationContext.future = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
};

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPath = location.pathname === '/signin' || location.pathname === '/signup';
  const { setUser, user, isAuthenticated, logout } = useStore();

  // Initialize the session management
  useEffect(() => {
    sessionService.initializeSession();
  }, []);

  // Check authentication on startup
  useEffect(() => {
    const validateAuth = async () => {
      // First check if we already have auth state in the store
      // This prevents unnecessary redirects during initial load
      if (isAuthenticated && user) {
        // We're already authenticated from persisted state
        // No need to redirect
        return;
      }

      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();
      
      // If we have local storage data but store is empty, sync them
      if (currentUser && token && !isAuthenticated) {
        setUser(currentUser);
        return;
      }

      // If we have a token, validate it
      if (token) {
        try {
          // Use the session service to restore the session
          const { valid, user } = await sessionService.restoreSession();
          
          if (valid && user) {
            // Update with the latest user data if validation was successful
            setUser(user);
          } else if (!isAuthPath) {
            // Only logout and redirect if we're sure the session is invalid
            authService.logout();
            logout();
            navigate('/signin');
          }
        } catch (error) {
          console.error('Session restoration failed:', error);
          
          // On errors, don't logout if we have a user in local storage
          if (currentUser && !isAuthenticated) {
            setUser(currentUser);
          }
        }
      } else if (!isAuthPath && !isAuthenticated) {
        // Only redirect to signin if not authenticated and not already on auth path
        navigate('/signin');
      }
    };

    validateAuth();
  }, [setUser, logout, isAuthPath, navigate, isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-gray-100">
      {!isAuthPath && <TopNavbar />}
      <div className={`${!isAuthPath ? 'pt-16' : ''} px-2 sm:px-3 md:px-4 max-w-7xl mx-auto`}>
        <AppRoutes />
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;