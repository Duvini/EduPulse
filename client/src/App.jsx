import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import TopNavbar from './components/TopNavbar/TopNavbar';
import AppRoutes from './routes/routes';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './utils/queryClient';

// Configure React Router future flags
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
NavigationContext.future = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
};

const Layout = () => {
  const location = useLocation();
  const isAuthPath = location.pathname === '/signin' || location.pathname === '/signup';

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </BrowserRouter>
      {/* Only include DevTools in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;