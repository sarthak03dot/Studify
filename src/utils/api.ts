import axios, { AxiosError, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '@env';

// const API_URL_LOCAL = "http://localhost:5000/api";
// const API_URL_EMULATOR = "http://10.0.2.2:5000/api";
// Using env variable now



const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log("Using API_URL:", API_URL);

// Request interceptor to add token to headers
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        // Unwrap data if it exists in our standard format
        return response.data?.status === 'success' ? response.data.data : response.data;
    },
    (error: AxiosError) => {
        if (error.response) {
            // Server responded with error
            const message = (error.response.data as any)?.message || 'An error occurred';
            return Promise.reject(new Error(message));
        } else if (error.request) {
            // Request made but no response
            return Promise.reject(new Error('Network error. Please check your connection.'));
        } else {
            // Something else happened
            return Promise.reject(new Error('An unexpected error occurred'));
        }
    }
);

export default apiClient;
