"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../api/lib/auth";

// Import the setAuthData function
const setAuthData = (userData, token) => {
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

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const credentials = { email, password };
      const response = await authService.login(credentials);
      
      console.log('Login successful:', response);
      console.log('Response structure:', Object.keys(response));
      
      // Store auth data for transaction API
      // Handle different possible response structures
      if (response.user && response.token) {
        setAuthData(response.user, response.token);
      } else if (response.access_token) {
        // If response has access_token and user data at root level
        setAuthData(response, response.access_token);
      } else if (response.data && response.data.user) {
        // If user data is nested in data object
        setAuthData(response.data.user, response.data.token || response.data.access_token);
      } else {
        // Fallback - try to extract user info from response
        console.log('Attempting to extract user data from response...');
        const userData = {
          id: response.user_id || response.id,
          name: response.name,
          email: response.email
        };
        const token = response.token || response.access_token || response.accessToken;
        setAuthData(userData, token);
      }
      
      // Debug: Check what was stored
      console.log('Stored user data:', localStorage.getItem('expense_tracker_user_data'));
      console.log('Stored token:', localStorage.getItem('auth_token'));
      
      // Redirect to home page (your dashboard)
      router.push('/home');
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Please sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 hover:border-purple-300"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 hover:border-purple-300"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>


          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;