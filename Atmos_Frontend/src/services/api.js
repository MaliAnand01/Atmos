import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create a centralized axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('atmos_token');
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }


  return config;
}, (error) => {
  return Promise.reject(error);
});

// Global error handler
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

class ApiService {
  async get(endpoint) {
    return axiosInstance.get(endpoint);
  }

  async post(endpoint, data) {
    return axiosInstance.post(endpoint, data);
  }

  async put(endpoint, data) {
    return axiosInstance.put(endpoint, data);
  }

  async delete(endpoint) {
    return axiosInstance.delete(endpoint);
  }

}

// Function to format external image links
export const getImageUrl = (url) => {
  if (!url || !url.startsWith('http')) return "https://images.unsplash.com/photo-1470221339082-e088f2067c7b?w=800&q=80";
  return url;
};

export const api = new ApiService();
export default axiosInstance;
