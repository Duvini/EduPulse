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
    }
};