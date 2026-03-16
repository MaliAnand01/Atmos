import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create a centralized axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Pass auth tokens automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('atmos_token');
  const userStr = localStorage.getItem('atmos_user');
  
  if (token) {
    config.headers['Authorization'] = `Basic ${token}`;
  }

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.id) config.headers['X-User-Id'] = user.id.toString();
      if (user.role) config.headers['X-User-Role'] = user.role;
    } catch (e) {
      console.error("Failed to parse user for headers", e);
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Centralized error handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

class ApiService {
  /** GET request */
  async get(endpoint) {
    return axiosInstance.get(endpoint);
  }

  /** POST request */
  async post(endpoint, data) {
    return axiosInstance.post(endpoint, data);
  }

  /** PUT request */
  async put(endpoint, data) {
    return axiosInstance.put(endpoint, data);
  }

  /** DELETE request */
  async delete(endpoint) {
    return axiosInstance.delete(endpoint);
  }

  /** Multi-part file upload */
  async upload(endpoint, file) {
    const formData = new FormData();
    formData.append('file', file);

    // Axios handles Multipart headers automatically when receiving FormData
    return axiosInstance.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

// Helper to format image URLs from the backend
export const getImageUrl = (url) => {
  if (!url) return "https://images.unsplash.com/photo-1470221339082-e088f2067c7b?w=800&q=80"; // Fallback
  if (url.startsWith('http')) return url;
  return `http://localhost:8080${url}`;
};

export const api = new ApiService();
export default axiosInstance;
