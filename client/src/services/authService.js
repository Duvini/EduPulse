import axiosInstance from './axiosConfig';

const API_URL = '/api/auth';

export const authService = {
    login: async (username, password) => {
        try {
            // Client-side validation
            if (!username?.trim() || !password?.trim()) {
                return { 
                    error: true, 
                    data: "Username and password are required",
                    status: 400
                };
            }

            const response = await axiosInstance.post(`${API_URL}/login`, {
                username,
                password
            });

            if (response.data?.data?.token) {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data));
                return response.data;
            }

            return {
                error: true,
                data: "Invalid server response",
                status: 500
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                error: true,
                data: error.response?.data?.message || 'An unexpected error occurred during login',
                status: error.response?.status || 500
            };
        }
    },

    register: async (username, email, password, name) => {
        try {
            // Client-side validation
            if (!username?.trim() || !email?.trim() || !password?.trim() || !name?.trim()) {
                return { 
                    error: true, 
                    data: "All fields are required",
                    status: 400
                };
            }

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return {
                    error: true,
                    data: "Please enter a valid email address",
                    status: 400
                };
            }

            // Password strength validation
            if (password.length < 6) {
                return {
                    error: true,
                    data: "Password must be at least 6 characters long",
                    status: 400
                };
            }

            const response = await axiosInstance.post(`${API_URL}/register`, {
                username,
                email,
                password,
                name
            });

            if (response.data?.data?.token) {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data));
                return response.data;
            }

            return {
                error: true,
                data: "Invalid server response",
                status: 500
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                error: true,
                data: error.response?.data?.message || 'An unexpected error occurred during registration',
                status: error.response?.status || 500
            };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            console.error('Error parsing user data:', e);
            // Clear invalid data
            localStorage.removeItem('user');
            return null;
        }
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    validateToken: async () => {
        try {
            const token = authService.getToken();
            if (!token) {
                return { error: true, data: 'No token found', status: 401 };
            }
            
            const response = await axiosInstance.post(`${API_URL}/validate`);
            
            if (response.data?.data) {
                localStorage.setItem('user', JSON.stringify(response.data.data));
                return { error: false, data: response.data.data };
            }

            return { error: true, data: 'Invalid response from server', status: 500 };
        } catch (error) {
            console.error('Token validation failed:', error);
            
            if (!error.response || (error.response.status !== 401 && error.response.status !== 403)) {
                const currentUser = authService.getCurrentUser();
                if (currentUser) {
                    return { error: false, data: currentUser };
                }
            }
            
            return {
                error: true,
                data: error.response?.data?.message || 'Token validation failed',
                status: error.response?.status || 500
            };
        }
    },

    updateUser: async (id, userData) => {
        try {
            if (!id?.trim()) {
                return { error: true, data: "User ID is required", status: 400 };
            }

            const response = await axiosInstance.put(`${API_URL}/users/${id}`, userData);
            
            if (response.data?.data) {
                const currentUser = authService.getCurrentUser();
                const updatedUser = { ...currentUser, ...response.data.data };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            return { error: false, data: response.data.data };
        } catch (error) {
            return {
                error: true,
                data: error.response?.data?.message || 'Failed to update user profile',
                status: error.response?.status || 500
            };
        }
    },

    updateProfilePicture: async (id, formData) => {
        try {
            if (!id?.trim()) {
                return { error: true, data: "User ID is required", status: 400 };
            }

            if (!formData || !(formData instanceof FormData)) {
                return { error: true, data: "Invalid profile picture data", status: 400 };
            }

            const response = await axiosInstance.put(`${API_URL}/users/${id}/profile-picture`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data?.data) {
                const currentUser = authService.getCurrentUser();
                const updatedUser = { ...currentUser, ...response.data.data };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                return { error: false, data: response.data.data };
            }

            return { error: true, data: "Invalid server response", status: 500 };
        } catch (error) {
            return {
                error: true,
                data: error.response?.data?.message || 'Failed to update profile picture',
                status: error.response?.status || 500
            };
        }
    },

    deleteUser: async (id) => {
        try {
            if (!id?.trim()) {
                return { error: true, data: "User ID is required", status: 400 };
            }

            const response = await axiosInstance.delete(`${API_URL}/users/${id}`);
            
            if (!response.data.error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            return response.data;
        } catch (error) {
            return {
                error: true,
                data: error.response?.data?.message || 'Failed to delete user',
                status: error.response?.status || 500
            };
        }
    },

    verifyPassword: async (password) => {
        try {
            if (!password?.trim()) {
                return { error: true, data: "Password is required", status: 400 };
            }

            const response = await axiosInstance.post(`${API_URL}/verify-password`, { password });
            return { error: false, data: response.data };
        } catch (error) {
            return {
                error: true,
                data: error.response?.data?.message || 'Password verification failed',
                status: error.response?.status || 500
            };
        }
    }
};