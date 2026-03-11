// Atmos API Service
const API_BASE_URL = 'http://localhost:8080/api';


class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /** Public headers */
  getPublicHeaders() {
    return { 'Content-Type': 'application/json' };
  }

  /** Auth and identity headers */
  getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('atmos_token');
    const userStr = localStorage.getItem('atmos_user');
    const user = userStr ? JSON.parse(userStr) : {};

    if (token) {
      headers['Authorization'] = `Basic ${token}`;
    }
    if (user.id) {
      headers['X-User-Id'] = user.id.toString();
    }
    if (user.role) {
      headers['X-User-Role'] = user.role;
    }
    return headers;
  }

  /** GET request */
  async get(endpoint, authenticated = false) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: authenticated ? this.getAuthHeaders() : this.getPublicHeaders()
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async post(endpoint, data) {
    const usePublic = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: usePublic ? this.getPublicHeaders() : this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async put(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async delete(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  /** Multi-part file upload */
  async upload(endpoint, file) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = {};
    const token = localStorage.getItem('atmos_token');
    if (token) {
      headers['Authorization'] = `Basic ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: formData
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Upload error! status: ${response.status}`);
    }
    return await response.json();
  }
}

// Helper to format image URLs from the backend
export const getImageUrl = (url) => {
  if (!url) return "https://images.unsplash.com/photo-1470221339082-e088f2067c7b?w=800&q=80"; // Fallback
  if (url.startsWith('http')) return url;
  return `http://localhost:8080${url}`;
};

export const api = new ApiService();
