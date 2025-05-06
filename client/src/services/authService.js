import axiosInstance from './axiosConfig';

const API_URL = '/api/auth';

export const authService = {
    login: async (username, password) => {
        const response = await axiosInstance.post(`${API_URL}/login`, {
            username,
            password
        });
        if (response.data?.data?.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data));
        }
        return response.data;
    },

    register: async (username, email, password, name) => {
        const response = await axiosInstance.post(`${API_URL}/register`, {
            username,
            email,
            password,
            name
        });
        if (response.data?.data?.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    getUserById: async (id) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/users/${id}`);
            return { error: false, data: response.data.data };
        } catch (err) {
            console.error('Error fetching user:', err);
            return { error: true, message: err.response?.data?.message || 'Error fetching user profile' };
        }
    },

    updateUser: async (id, userData) => {
        const response = await axiosInstance.put(`${API_URL}/users/${id}`, userData);
        if (response.data?.data) {
            // Update the stored user data
            const currentUser = authService.getCurrentUser();
            const updatedUser = { ...currentUser, ...response.data.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        return response.data;
    },

    updateProfilePicture: async (id, formData) => {
        const response = await axiosInstance.put(`${API_URL}/users/${id}/profile-picture`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (response.data?.data) {
            // Update the stored user data
            const currentUser = authService.getCurrentUser();
            const updatedUser = { ...currentUser, ...response.data.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await axiosInstance.delete(`${API_URL}/users/${id}`);
        if (!response.data.error) {
            // Clear local storage since the account is being deleted
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return response.data;
    },

    validateToken: async () => {
        try {
            const token = authService.getToken();
            if (!token) {
                return { error: true, data: 'No token found' };
            }
            
            // Try to validate the token with the backend
            const response = await axiosInstance.post(`${API_URL}/validate`);
            
            if (response.data?.data) {
                // Update stored user data with fresh data from server
                localStorage.setItem('user', JSON.stringify(response.data.data));
                return response.data;
            } else {
                // If we get a response but no data, still consider it valid
                // This prevents unnecessary logouts
                const currentUser = authService.getCurrentUser();
                if (currentUser) {
                    return { error: false, data: currentUser };
                }
                return { error: true, data: 'Invalid user data' };
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            
            // If the server is unreachable or returns an error not related to auth,
            // don't automatically invalidate the session
            if (!error.response || (error.response.status !== 401 && error.response.status !== 403)) {
                const currentUser = authService.getCurrentUser();
                if (currentUser) {
                    // Keep using existing user data rather than logging out
                    return { error: false, data: currentUser };
                }
            }
            
            // Only return error for actual authentication issues
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                return { error: true, data: 'Token validation failed' };
            }
            
            // For network errors, keep session active
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                return { error: false, data: currentUser };
            }
            
            return { error: true, data: 'Token validation failed' };
        }
    },

    searchUsers: async (username) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/users/search`, {
                params: { username }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching users:', error);
            return { error: true, message: 'Error searching users' };
        }
    },

    verifyPassword: async (password) => {
        try {
            const response = await axiosInstance.post(`${API_URL}/verify-password`, { password });
            return { error: false, data: response.data };
        } catch (err) {
            return { error: true, message: err.response?.data?.message || 'Password verification failed' };
        }
    }
};