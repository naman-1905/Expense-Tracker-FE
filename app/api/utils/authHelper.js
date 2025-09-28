

// Helper function to set authentication data after login
export const setAuthData = (userData, token) => {
  try {
    // Store user data in localStorage for transaction API
    if (userData) {
      localStorage.setItem('expense_tracker_user_data', JSON.stringify({
        id: userData.user_id || userData.id,
        name: userData.name,
        email: userData.email
      }));
    }
    
    // Store token in localStorage as backup (main storage is in cookies)
    if (token) {
      localStorage.setItem('auth_token', token);
    }
    
    console.log('Auth data set successfully:', {
      userData: userData ? 'Set' : 'Not provided',
      token: token ? 'Set' : 'Not provided'
    });
  } catch (error) {
    console.error('Error setting auth data:', error);
  }
};

// Helper function to clear authentication data on logout
export const clearAuthData = () => {
  try {
    localStorage.removeItem('expense_tracker_user_data');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('expense_tracker_access_token');
    
    // Also clear cookies (you might need to do this on the server side)
    document.cookie = 'expense_tracker_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    console.log('Auth data cleared successfully');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Helper function to get current auth status
export const getAuthStatus = () => {
  try {
    const userData = localStorage.getItem('expense_tracker_user_data');
    const token = localStorage.getItem('auth_token');
    
    // Check cookies as well
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('expense_tracker_access_token=')
    );
    
    return {
      isAuthenticated: !!(userData && (token || tokenCookie)),
      userData: userData ? JSON.parse(userData) : null,
      hasToken: !!(token || tokenCookie)
    };
  } catch (error) {
    console.error('Error getting auth status:', error);
    return {
      isAuthenticated: false,
      userData: null,
      hasToken: false
    };
  }
};

// Updated auth API with localStorage integration
export const enhancedAuthAPI = {
  // Login user and set auth data
  login: async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Set authentication data in localStorage
      if (data.user && data.token) {
        setAuthData(data.user, data.token);
      } else if (data.access_token) {
        // If the response structure is different
        setAuthData(data.user || data, data.access_token);
      }
      
      return data;
    } catch (error) {
      throw new Error(error.message || 'Network error during login');
    }
  },

  // Signup user and set auth data
  signup: async (userData) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }
      
      // Set authentication data in localStorage
      if (data.user && data.token) {
        setAuthData(data.user, data.token);
      } else if (data.access_token) {
        // If the response structure is different
        setAuthData(data.user || data, data.access_token);
      }
      
      return data;
    } catch (error) {
      throw new Error(error.message || 'Network error during signup');
    }
  },

  // Logout user and clear auth data
  logout: async () => {
    try {
      // Call logout endpoint if you have one
      // await fetch('/api/auth/logout', { method: 'POST' });
      
      // Clear local auth data
      clearAuthData();
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if server request fails
      clearAuthData();
      return { success: true };
    }
  }
};