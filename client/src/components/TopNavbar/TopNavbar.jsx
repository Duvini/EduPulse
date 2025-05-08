import React, { useEffect, useRef, useState } from 'react';
import { FiHome, FiBook, FiSettings, FiHelpCircle, FiSearch, FiMenu, FiX, FiBell } from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../../store';
import { getMediaUrl } from '../../services/axiosConfig';
import { authService } from '../../services/authService';
import Modal from '../Modal/Modal';

const TopNavbar = () => {
  const location = useLocation();
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const {
    notifications, 
    unreadNotificationCount, 
    isNotificationsOpen, 
    toggleMobileMenu,
    toggleNotificationsDropdown, 
    closeNotificationsDropdown, 
    markAllNotificationsAsRead,
    markNotificationAsRead, 
    isMobileMenuOpen, 
    isSearchFocused, 
    setSearchFocused, 
    user, 
    logout
  } = useStore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        closeNotificationsDropdown();
        setIsUserMenuOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [closeNotificationsDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        closeNotificationsDropdown();
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeNotificationsDropdown]);

  const handleSignOut = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id || !deletePassword) return;
    
    setIsDeleting(true);
    setError('');
    setSuccess('');
    
    try {
      // First verify the password
      const verifyResponse = await authService.verifyPassword(deletePassword);
      if (verifyResponse.error) {
        setError('Incorrect password. Please try again.');
        setIsDeleting(false);
        return;
      }

      // Then proceed with account deletion
      const response = await authService.deleteUser(user.id);
      if (!response.error) {
        setIsDeleteModalOpen(false);
        // Immediately logout and redirect
        authService.logout();
        navigate('/signin');
      } else {
        setError(response.message || 'Failed to delete account');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while deleting account');
    } finally {
      setIsDeleting(false);
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Default user avatar as SVG data URL
  const defaultUserAvatar = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23CBD5E1"%3E%3Cpath d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"%3E%3C/path%3E%3C/svg%3E';

  // Mock data - in a real app, this would come from the API via the store
  const userProfile = user !== null && user !== undefined ? user : {
    name: 'Guest User',
    role: 'Not Signed In',
    avatar: defaultUserAvatar
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="w-full bg-[#4937ce] text-white shadow-lg z-10 fixed top-0 left-0">
        <div className="px-4 mx-auto max-w-7xl">
          {/* Desktop Navigation */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="bg-white text-[#4937ce] w-7 h-7 rounded-md flex items-center justify-center font-bold mr-2">E</span>
              <span className="hidden text-lg font-bold sm:block">EduPulse</span>
            </div>

            {/* Search Bar */}
            <div className={`relative hidden md:block flex-1 mx-10 ${isSearchFocused ? 'max-w-md' : 'max-w-xs'} transition-all duration-200`}>
              <form onSubmit={handleSearchSubmit} className="flex items-center p-2 rounded-full bg-white/20">
                <FiSearch className="ml-1 mr-2 text-white" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full text-white bg-transparent border-none outline-none placeholder-white/70"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </form>
            </div>

            {/* Desktop Menu Items */}
            <div className="items-center hidden space-x-1 md:flex">
              <Link 
                to="/feed" 
                className={`flex flex-col items-center px-3 py-2 rounded-md transition-colors duration-200 ${
                  isActiveRoute('/feed') 
                    ? 'text-white bg-white/20' 
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <FiHome className="text-xl mb-0.5" />
                <span className="text-xs">Feed</span>
              </Link>
              <Link 
                to="/learning-plans" 
                className={`flex flex-col items-center px-3 py-2 rounded-md transition-colors duration-200 ${
                  isActiveRoute('/learning-plans') 
                    ? 'text-white bg-white/20' 
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <FiBook className="text-xl mb-0.5" />
                <span className="text-xs">Learn</span>
              </Link>
            </div>

            {/* User Menu, Notifications & Mobile Toggle */}
            <div className="flex items-center">
              {/* Notifications */}
              <div className="relative ml-2" ref={notificationRef}>
                <button 
                  className={`p-1.5 rounded-full transition-colors duration-200 flex items-center justify-center relative ${
                    isNotificationsOpen ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                  onClick={toggleNotificationsDropdown}
                >
                  <FiBell className="text-xl" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>
                
                {isNotificationsOpen && (
                  <div className="absolute right-0 z-20 mt-2 overflow-hidden bg-white rounded-md shadow-lg w-72">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      {unreadNotificationCount > 0 && (
                        <button 
                          className="text-xs text-blue-600 hover:text-blue-800"
                          onClick={markAllNotificationsAsRead}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <div className="overflow-y-auto max-h-80">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-gray-500">No notifications</div>
                      ) : (
                        notifications.map(notification => (
                          <div 
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex items-start">
                              <img 
                                src={notification.avatar} 
                                alt="User" 
                                className="object-cover w-8 h-8 mr-3 rounded-full"
                              />
                              <div>
                                <p className="text-sm text-gray-800">{notification.text}</p>
                                <p className="mt-1 text-xs text-gray-500">{notification.time}</p>
                              </div>
                              {!notification.read && (
                                <div className="ml-auto">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="px-4 py-2 text-center border-t border-gray-200">
                      <Link to="/notifications" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        See all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Profile */}
              <div className="relative ml-2" ref={userMenuRef}>
                <button 
                  className="flex items-center p-1 rounded-full focus:outline-none hover:bg-white/10"
                  onClick={toggleUserMenu}
                >
                  <div className="relative w-8 h-8">
                    <img 
                      src={user?.profilePicture ? getMediaUrl(user.profilePicture) : defaultUserAvatar}
                      alt="User avatar" 
                      className="object-cover w-8 h-8 bg-gray-100 rounded-full"
                      onError={(e) => {
                        e.target.src = defaultUserAvatar;
                      }}
                    />
                  </div>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 z-20 w-48 mt-2 overflow-hidden bg-white rounded-md shadow-lg">
                    <div className="px-4 py-3 text-sm text-gray-800 border-b border-gray-200">
                      <div className="font-bold truncate">{userProfile.name}</div>
                      <div className="text-xs text-gray-500 truncate">{userProfile.role}</div>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-100">Profile</Link>
                      <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-100">Settings</Link>
                      <Link to="/help" className="block px-4 py-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-100">Help & Support</Link>
                      <button 
                        className="block w-full px-4 py-2 text-sm text-left text-red-600 transition-colors duration-150 hover:bg-red-50"
                        onClick={() => setIsDeleteModalOpen(true)}
                      >
                        Delete Account
                      </button>
                      <button 
                        onClick={handleSignOut} 
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 transition-colors duration-150 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button 
                className="ml-2 text-white md:hidden focus:outline-none"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#4937ce]">
            <div className="px-4 pt-2 pb-3">
              <div className="flex items-center p-2 rounded-full bg-white/20">
                <FiSearch className="ml-1 mr-2 text-white" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="w-full text-white bg-transparent border-none outline-none placeholder-white/70"
                />
              </div>
            </div>
            
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                to="/feed" 
                className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${
                  isActiveRoute('/feed') 
                    ? 'bg-white/20 text-white' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <FiHome className="mr-3 text-lg" />
                <span>Feed</span>
              </Link>
              
              <Link 
                to="/learning-plans" 
                className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${
                  isActiveRoute('/learning-plans') 
                    ? 'bg-white/20 text-white' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <FiBook className="mr-3 text-lg" />
                <span>Learn Plans</span>
              </Link>
              
              <Link 
                to="/notifications" 
                className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${
                  isActiveRoute('/notifications') 
                    ? 'bg-white/20 text-white' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <FiBell className="mr-3 text-lg" />
                <span>Notifications</span>
                {unreadNotificationCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white rounded-full py-0.5 px-2 text-xs font-bold">{unreadNotificationCount}</span>
                )}
              </Link>
              
              <Link 
                to="/settings" 
                className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${
                  isActiveRoute('/settings') 
                    ? 'bg-white/20 text-white' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <FiSettings className="mr-3 text-lg" />
                <span>Settings</span>
              </Link>
              
              <Link 
                to="/help" 
                className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${
                  isActiveRoute('/help') 
                    ? 'bg-white/20 text-white' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <FiHelpCircle className="mr-3 text-lg" />
                <span>Help & Support</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="h-16"></div>

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <Modal onClose={() => setIsDeleteModalOpen(false)}>
          <div className="p-4">
            <h2 className="mb-4 text-lg font-bold">Delete Account</h2>
            <p className="mb-4 text-sm text-gray-600">Please enter your password to confirm account deletion. This action cannot be undone.</p>
            {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
            {success && <p className="mb-2 text-sm text-green-600">{success}</p>}
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-3 py-2 mb-4 border rounded-md"
            />
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="px-4 py-2 text-gray-800 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount} 
                className="px-4 py-2 text-white bg-red-600 rounded-md"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default TopNavbar;