import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../../store';
import { authService } from '../../services/authService';

const OAuth2Callback = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useStore((state) => state.setUser);
  
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('OAuth2 callback received, processing...');
        
        // Parse the query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userId = params.get('userId');
        const username = params.get('username');
        const email = params.get('email');
        const name = params.get('name');
        
        console.log('OAuth2 params:', { userId, username, email, name });

        if (!token || !userId || !username) {
          console.error('Missing required OAuth2 parameters');
          setError('Invalid authentication response');
          setLoading(false);
          return;
        }

        // Store the token in localStorage
        localStorage.setItem('token', token);

        // Create a user object and store it
        const user = {
          id: userId,
          username,
          email,
          name,
          provider: 'google'
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        console.log('User stored in localStorage');
        
        // Update the user in the store
        setUser(user);
        console.log('User updated in store');
        
        // Redirect to home page
        console.log('Redirecting to home page');
        navigate('/');
      } catch (err) {
        console.error('Error processing OAuth callback:', err);
        setError('Failed to process authentication. Please try again.');
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [location, navigate, setUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-[#4937ce] text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold">
              E
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-4">Completing your sign in...</h2>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-t-2 border-b-2 border-[#4937ce] rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-[#4937ce] text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold">
                E
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
            <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
              {error}
            </div>
            <button
              onClick={() => navigate('/signin')}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#4937ce] hover:bg-[#3c2ba7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4937ce]"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuth2Callback;