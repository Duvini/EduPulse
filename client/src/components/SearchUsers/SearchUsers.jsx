import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { getMediaUrl } from '../../services/axiosConfig';
import { FiSearch } from 'react-icons/fi';

const SearchUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError('');
      const response = await authService.searchUsers(query);
      if (response.error) {
        setError(response.message || 'Error searching users');
        return;
      }
      setSearchResults(response.data || []);
    } catch (err) {
      setError('Failed to search users');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      await performSearch(searchQuery);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-4 p-4">
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by username..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="p-4 mb-4 text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {searchResults.map((searchUser) => (
              <div
                key={searchUser.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <Link
                  to={`/profile/${searchUser.id}`}
                  className="flex items-center flex-1 min-w-0"
                >
                  <img
                    src={searchUser.profilePicture ? getMediaUrl(searchUser.profilePicture) : '/default-avatar.png'}
                    alt={`${searchUser.username}'s avatar`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-4 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {searchUser.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      @{searchUser.username}
                    </p>
                  </div>
                </Link>
              </div>
            ))}

            {!loading && !error && searchResults.length === 0 && searchQuery && (
              <div className="text-center py-8 text-gray-500">
                No users found matching "{searchQuery}"
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchUsers;