import axios from 'axios';

// Use VITE_API_URL if configured (e.g., in production on Vercel), fallback to '/api' for local dev proxy
const baseURL = import.meta.env.VITE_API_URL || '/api';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT Bearer Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('placement_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global errors (e.g. 401 Expired Token)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('placement_jwt_token');
        localStorage.removeItem('placement_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
