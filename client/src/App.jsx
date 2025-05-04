import React, { useEffect } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import TopNavbar from './components/TopNavbar/TopNavbar';
import AppRoutes from './routes/routes';
import { useStore } from '../store';
import { authService } from './services/authService';

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
  const { setUser, logout } = useStore();

  // Check authentication on startup
  useEffect(() => {
    const validateAuth = async () => {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      
      if (token && currentUser) {
        try {
          const response = await authService.validateToken();
          if (response.error) {
            // If token validation fails, log out
            authService.logout();
            logout();
            if (!isAuthPath) {
              navigate('/signin');
            }
          } else {
            // Update user data from the server response
            setUser(response.data);
          }
        } catch (error) {
          console.error('Authentication validation failed:', error);
          // If validation request fails, log out
          authService.logout();
          logout();
          if (!isAuthPath) {
            navigate('/signin');
          }
        }
      } else if (!isAuthPath) {
        // If no token or user, and not on auth path, redirect to signin
        navigate('/signin');
      }
    };

    validateAuth();
  }, [setUser, logout, isAuthPath, navigate]);

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