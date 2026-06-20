import axios from 'axios';

// Detect the correct API base URL:
// - If VITE_API_URL is set (production), use it directly.
// - Otherwise, use the same hostname the browser used to reach the frontend.
//   This ensures cross-device compatibility on local networks.
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const host = window.location.hostname;
  const port = 8000;
  const protocol = window.location.protocol; // http: or https:
  return `${protocol}//${host}:${port}/api/`;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// Request interceptor for adding auth tokens (placeholder for now)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (e.g., clear token, redirect to login)
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // window.location.href = '/login'; // Let components handle redirect
    }
    return Promise.reject(error);
  }
);

export default api;
