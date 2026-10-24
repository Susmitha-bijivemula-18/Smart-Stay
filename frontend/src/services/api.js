import axios from 'axios';

// Dynamic API URL for local dev and cloud production (Vercel -> Render)
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isAuthRequest = config.url.includes('/auth/login') || config.url.includes('/auth/register');
    
    if (token && !isAuthRequest) {
      console.log("api.js: Token found. Adding to header for: " + config.url);
      config.headers.Authorization = `Bearer ${token}`;
    } else if (isAuthRequest) {
      console.log("api.js: Skipping token for auth request: " + config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          console.log("api.js: Attempting to refresh token...");
          const response = await axios.post(`${API_BASE_URL}/auth/refreshtoken`, {
            refreshToken: refreshToken,
          }, { withCredentials: true });

          const { token, accessToken, refreshToken: newRefreshToken } = response.data;
          const newToken = token || accessToken;
          
          console.log("api.js: Token refreshed successfully.");
          localStorage.setItem('token', newToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("api.js: Token refresh request failed", refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    const isAuthRequest = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthRequest) {
      console.error("api.js: Final 401 detected. Logging out and redirecting to login.");
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
