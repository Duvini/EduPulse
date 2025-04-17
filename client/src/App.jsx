import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import TopNavbar from './components/TopNavbar/TopNavbar';
import AppRoutes from './routes/routes';
import { useStore } from '../store';

// Mock data for initializing our store
const mockUser = {
  id: 'usr-123',
  name: 'Azunyan U. Wu',
  role: 'Basic Member',
  avatar: '/api/placeholder/40/40',
  email: 'azunyan@example.com',
};

const mockNotifications = [
  {
    id: 1,
    avatar: '/api/placeholder/40/40',
    text: 'John Smith commented on your post',
    time: '2 minutes ago',
    read: false
  },
  {
    id: 2,
    avatar: '/api/placeholder/40/40',
    text: 'Alice Johnson liked your comment',
    time: '1 hour ago',
    read: false
  },
  {
    id: 3,
    avatar: '/api/placeholder/40/40',
    text: 'New course recommendation: Advanced JavaScript',
    time: 'Yesterday',
    read: true
  }
];

const Layout = () => {
  const location = useLocation();
  const isRootPath = location.pathname === '/';
  const { setUser, setNotifications, setUnreadCount } = useStore();

  // Initialize store with mock data
  useEffect(() => {
    setUser(mockUser);
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, [setUser, setNotifications, setUnreadCount]);

  return (
    <div className="min-h-screen bg-gray-100">
      {!isRootPath && <TopNavbar />}
      <div className="pt-2 px-2 sm:px-3 md:px-4 max-w-7xl mx-auto">
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