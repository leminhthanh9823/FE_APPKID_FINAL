import axios from 'axios';
import { ROUTES } from '../routers/routes';

const API_URL = import.meta.env.VITE_API_URL as string;
const REFRESH_URL = `${API_URL}/auth/refresh-token`;
const token = localStorage.getItem('accessToken');

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});

const tokenStorage = {
  get accessToken() {
    return localStorage.getItem('accessToken') || '';
  },
  get refreshToken() {
    return localStorage.getItem('refreshToken') || '';
  },
  setTokens(access: string, refresh: string) {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  },
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = tokenStorage.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // if queue have a refresh request, all request wait for new access request
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          REFRESH_URL,
          { token: tokenStorage.refreshToken },
          {
            headers: {
              Authorization: `Bearer ${tokenStorage.refreshToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // update new token
        tokenStorage.setTokens(data.data.access_token, data.data.refresh_token);
        isRefreshing = false;

        onTokenRefreshed(data.data.access_token);

        originalRequest.headers.Authorization = `Bearer ${data.data.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        tokenStorage.clearTokens();
        window.location.href = ROUTES.LOGIN;
        return Promise.reject(
          new Error('Session has expired. Please log in again.')
        );
      }
    }
    if (error.response) {
      const status = error.response.status;
      let errors = error.response.data?.errors || [];
      const message = errors && errors.length > 0 
        ? errors[0]
        : error.response.data?.message || "Unknown error.";
      if (status >= 400 && status < 500) {
        return Promise.reject(message);
      } else if (status >= 500) {
        return Promise.reject(`Please try again later.`);
      }
    } else if (error.request) {
      console.error("Cannot connect to server:", error);
      return Promise.reject("Cannot connect to server. Please check your network connection.");
    } else {
      console.error("Unknown error:", error);
      return Promise.reject("An unknown error occurred. Please try again later.");
    }
  }
);

export default apiClient;
