import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../../store';

const AuthTestPage = () => {
  const { user, isAuthenticated } = useStore();

  useEffect(() => {
    console.log('Auth test page loaded');
    
    // Instructions for testing auth in console
    console.log('=== Auth Testing Instructions ===');
    console.log('1. To check current auth state: localStorage.getItem("user")');
    console.log('2. To check token: localStorage.getItem("token")');
    console.log('3. To clear auth state: localStorage.clear()');
    console.log('4. To check auth provider: const user = JSON.parse(localStorage.getItem("user")); console.log(user?.provider || "traditional")');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 mx-auto">
        <div>
          <div className="flex justify-center mb-6">
            <div className="bg-[#4937ce] text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold">
              E
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Test Page
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use this page to test different authentication methods
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Current Authentication Status</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">Status:</span> {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
              </p>
              {user && (
                <>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">User ID:</span> {user.id}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Username:</span> {user.username}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Email:</span> {user.email}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Name:</span> {user.name}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Auth Method:</span> {user.provider === 'google' ? 'Google OAuth2' : 'Traditional'}
                  </p>
                </>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Test Authentication</h3>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Open the browser console to see testing instructions.
                </p>
                <p className="text-sm text-gray-600">
                  You can test Google OAuth2 login by clicking the "Sign in with Google" button on the sign-in page.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Link
                to="/signin"
                className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4937ce] hover:bg-[#3c2ba7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4937ce]"
              >
                Go to Sign In
              </Link>
              
              <Link
                to="/"
                className="flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4937ce]"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage;