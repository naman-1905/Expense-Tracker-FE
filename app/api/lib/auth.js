import { authAPI } from '../utils/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'expense_tracker_access_token';
const REFRESH_TOKEN_KEY = 'expense_tracker_refresh_token';
const USER_DATA_KEY = 'expense_tracker_user_data';

export const tokenManager = {
  // Get access token from localStorage
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  },

  // Get refresh token from localStorage
  getRefreshToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  // Set tokens in localStorage
  setTokens: (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  // Remove all tokens and user data
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    }
  },

  // Get stored user data
  getUserData: () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  // Set user data in localStorage
  setUserData: (userData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!tokenManager.getAccessToken();
  },
};

export const authService = {
  // Login and store tokens
  login: async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Store tokens and user data
      tokenManager.setTokens(response.token, response.refreshToken);
      tokenManager.setUserData(response.user);
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Signup and store tokens
  signup: async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      
      // Store tokens and user data
      tokenManager.setTokens(response.token, response.refreshToken);
      tokenManager.setUserData(response.user);
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout and clear tokens
  logout: () => {
    tokenManager.clearTokens();
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const token = tokenManager.getAccessToken();
      if (!token) {
        throw new Error('No access token found');
      }
      
      return await authAPI.getProfile(token);
    } catch (error) {
      // If token is invalid, try to refresh
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        try {
          await authService.refreshAccessToken();
          const newToken = tokenManager.getAccessToken();
          return await authAPI.getProfile(newToken);
        } catch (refreshError) {
          authService.logout();
          throw refreshError;
        }
      }
      throw error;
    }
  },

  // Refresh access token
  refreshAccessToken: async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      
      const response = await authAPI.refreshToken(refreshToken);
      tokenManager.setTokens(response.token, refreshToken);
      
      return response;
    } catch (error) {
      // If refresh fails, logout user
      authService.logout();
      throw error;
    }
  },
};