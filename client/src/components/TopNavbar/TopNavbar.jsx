import React, { useEffect, useRef } from 'react';
import { FiHome, FiBook, FiUsers, FiCreditCard, FiSettings, FiHelpCircle, FiSearch, FiStar, FiMenu, FiX, FiBell } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useStore } from '../../../store';

const TopNavbar = () => {
  const notificationRef = useRef(null);

  const {notifications, unreadNotificationCount, isNotificationsOpen, toggleMobileMenu,toggleNotificationsDropdown, closeNotificationsDropdown, markAllNotificationsAsRead,markNotificationAsRead, isMobileMenuOpen, isSearchFocused, 
    setSearchFocused, user, logout
  } = useStore()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        closeNotificationsDropdown();
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeNotificationsDropdown]);

  const handleSignOut = () => {
    logout();
    // TODO: You may want to redirect here using react-router
    // history.push('/login');
  };

  // Mock data - in a real app, this would come from the API via the store
  const userProfile = user || {
    name: 'Azunyan U. Wu',
    role: 'Basic Member',
    avatar: '/api/placeholder/40/40'
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="w-full bg-[#4937ce] text-white shadow-lg z-10 fixed top-0 left-0">
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop Navigation */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="bg-white text-[#4937ce] w-7 h-7 rounded-md flex items-center justify-center font-bold mr-2">E</span>
              <span className="text-lg font-bold hidden sm:block">EduPulse</span>
            </div>

            {/* Search Bar */}
            <div className={`relative hidden md:block flex-1 mx-10 ${isSearchFocused ? 'max-w-md' : 'max-w-xs'} transition-all duration-200`}>
              <div className="bg-white/20 rounded-full p-2 flex items-center">
                <FiSearch className="text-white ml-1 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="bg-transparent border-none text-white outline-none w-full placeholder-white/70"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
            </div>

            {/* Desktop Menu Items */}
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/feed" className="px-3 py-2 rounded-md flex flex-col items-center text-white/90 hover:text-white hover:bg-white/10">
                <FiHome className="text-xl mb-0.5" />
                <span className="text-xs">Feed</span>
              </Link>
              <Link to="/learning-plans" className="px-3 py-2 rounded-md flex flex-col items-center text-white/90 hover:text-white hover:bg-white/10">
                <FiBook className="text-xl mb-0.5" />
                <span className="text-xs">Learn</span>
              </Link>
              <Link to="/friends" className="px-3 py-2 rounded-md flex flex-col items-center text-white/90 hover:text-white hover:bg-white/10 relative">
                <FiUsers className="text-xl mb-0.5" />
                <span className="text-xs">Friends</span>
                <span className="absolute top-0 right-0 bg-white text-[#4937ce] rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">2</span>
              </Link>
              <Link to="/subscription" className="px-3 py-2 rounded-md flex flex-col items-center text-white/90 hover:text-white hover:bg-white/10">
                <FiCreditCard className="text-xl mb-0.5" />
                <span className="text-xs">Pro</span>
              </Link>
            </div>

            {/* User Menu, Notifications & Mobile Toggle */}
            <div className="flex items-center">
              {/* Notifications */}
              <div className="relative ml-2" ref={notificationRef}>
                <button 
                  className="p-1.5 rounded-full hover:bg-white/10 flex items-center justify-center relative"
                  onClick={toggleNotificationsDropdown}
                >
                  <FiBell className="text-xl" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg overflow-hidden z-20">
                    <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
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
                    
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">No notifications</div>
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
                                className="w-8 h-8 rounded-full mr-3 object-cover"
                              />
                              <div>
                                <p className="text-sm text-gray-800">{notification.text}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
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
                      <Link to="/notifications" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        See all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Profile */}
              <div className="relative group ml-2">
                <button className="flex items-center focus:outline-none">
                  <img src={userProfile.avatar} alt="User avatar" className="w-8 h-8 rounded-full object-cover" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
                  <div className="px-4 py-3 text-sm text-gray-800">
                    <div className="font-bold">{userProfile.name}</div>
                    <div className="text-xs text-gray-500">{userProfile.role}</div>
                  </div>
                  <div className="border-t border-gray-200">
                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                    <Link to="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Help & Support</Link>
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Sign out
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile menu button */}
              <button 
                className="md:hidden ml-2 text-white focus:outline-none"
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
            {/* Mobile Search */}
            <div className="px-4 pt-2 pb-3">
              <div className="bg-white/20 rounded-full p-2 flex items-center">
                <FiSearch className="text-white ml-1 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="bg-transparent border-none text-white outline-none w-full placeholder-white/70"
                />
              </div>
            </div>
            
            {/* Mobile Navigation Links */}
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/feed" className="flex items-center px-3 py-2 rounded-md text-white hover:bg-white/10">
                <FiHome className="mr-3 text-lg" />
                <span>Feed</span>
                <span className="ml-auto bg-white text-[#4937ce] rounded-full py-0.5 px-2 text-xs font-bold">10</span>
              </Link>
              
              <Link to="/learning-plans" className="flex items-center px-3 py-2 rounded-md text-white hover:bg-white/10">
                <FiBook className="mr-3 text-lg" />
                <span>Learn Plans</span>
              </Link>
              
              <Link to="/friends" className="flex items-center px-3 py-2 rounded-md text-white hover:bg-white/10">
                <FiUsers className="mr-3 text-lg" />
                <span>Friends</span>
                <span className="ml-auto bg-white text-[#4937ce] rounded-full py-0.5 px-2 text-xs font-bold">2</span>
              </Link>
              
              <Link to="/notifications" className="flex items-center px-3 py-2 rounded-md text-white hover:bg-white/10">
                <FiBell className="mr-3 text-lg" />
                <span>Notifications</span>
                {unreadNotificationCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white rounded-full py-0.5 px-2 text-xs font-bold">{unreadNotificationCount}</span>
                )}
              </Link>
              
              <Link to="/subscription" className="flex items-center px-3 py-2 rounded-md text-white hover:bg-white/10">
                <FiCreditCard className="mr-3 text-lg" />
                <span>Subscription</span>
              </Link>
              
              <Link to="/settings" className="flex items-center px-3 py-2 rounded-md text-white hover:bg-white/10">
                <FiSettings className="mr-3 text-lg" />
                <span>Settings</span>
              </Link>
              
              <Link to="/help" className="flex items-center px-3 py-2 rounded-md text-white hover:bg-white/10">
                <FiHelpCircle className="mr-3 text-lg" />
                <span>Help & Support</span>
              </Link>
              
              {/* Go Pro Banner */}
              <div className="bg-white/15 rounded-lg p-4 flex justify-between items-center mt-4 mx-3">
                <button className="bg-transparent border-none text-white font-bold cursor-pointer p-0">Go Pro</button>
                <FiStar className="text-lg" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default TopNavbar;