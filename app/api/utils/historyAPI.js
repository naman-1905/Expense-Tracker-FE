const API_BASE_URL = process.env.NEXT_PUBLIC_HISTORY_API;

// Get authentication token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('expense_tracker_access_token');
  }
  return null;
};

// Create headers with authentication
const createHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Get user ID from JWT token (decode the payload)
const getUserIdFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Get total balance
export const getTotalBalance = async () => {
  try {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error('User not authenticated');

    const response = await fetch(`${API_BASE_URL}/api/history/balance?user_id=${userId}`, {
      method: 'GET',
      headers: createHeaders()
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
};

// Get total income
export const getTotalIncome = async () => {
  try {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error('User not authenticated');

    const response = await fetch(`${API_BASE_URL}/api/history/income?user_id=${userId}`, {
      method: 'GET',
      headers: createHeaders()
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching income:', error);
    throw error;
  }
};

// Get total expenses
export const getTotalExpenses = async () => {
  try {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error('User not authenticated');

    const response = await fetch(`${API_BASE_URL}/api/history/expenses?user_id=${userId}`, {
      method: 'GET',
      headers: createHeaders()
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

// Get all summary data at once
export const getSummaryData = async () => {
  try {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error('User not authenticated');

    // Make parallel requests for better performance
    const [balanceResponse, incomeResponse, expensesResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/history/balance?user_id=${userId}`, {
        method: 'GET',
        headers: createHeaders()
      }),
      fetch(`${API_BASE_URL}/api/history/income?user_id=${userId}`, {
        method: 'GET',
        headers: createHeaders()
      }),
      fetch(`${API_BASE_URL}/api/history/expenses?user_id=${userId}`, {
        method: 'GET',
        headers: createHeaders()
      })
    ]);

    // Handle responses
    const [balanceData, incomeData, expensesData] = await Promise.all([
      handleResponse(balanceResponse),
      handleResponse(incomeResponse),
      handleResponse(expensesResponse)
    ]);

    // Return formatted data matching your Summary component structure
    return {
      totalBalance: balanceData.balance || 0,
      totalIncome: incomeData.total_income || 0,
      totalExpenses: expensesData.total_expenses || 0
    };
  } catch (error) {
    console.error('Error fetching summary data:', error);
    throw error;
  }
};

// Get recent transactions
export const getRecentTransactions = async (days = 30, limit = 100) => {
  try {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error('User not authenticated');

    const params = new URLSearchParams({
      user_id: userId,
      days: days.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/history/transactions?${params.toString()}`, {
      method: 'GET',
      headers: createHeaders()
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// Get transactions with date range
export const getTransactionsDateRange = async (startDate, endDate, limit = 100) => {
  try {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error('User not authenticated');

    const params = new URLSearchParams({
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/history/transactions?${params.toString()}`, {
      method: 'GET',
      headers: createHeaders()
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching transactions with date range:', error);
    throw error;
  }
};

// Health check
export const checkHistoryServiceHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/history/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error checking service health:', error);
    throw error;
  }
};