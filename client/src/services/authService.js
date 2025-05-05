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
        return response.data;
    },

    validateToken: async () => {
        try {
            const token = authService.getToken();
            if (!token) {
                return { error: true, data: 'No token found' };
            }
            const response = await axiosInstance.post(`${API_URL}/validate`);
            if (response.data?.data) {
                // Update stored user data with fresh data from server
                localStorage.setItem('user', JSON.stringify(response.data.data));
            }
            return response.data;
        } catch (error) {
            console.error('Token validation failed:', error);
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
    }
};