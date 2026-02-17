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
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || errorData.error || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
};

// Decode user ID from JWT token payload
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

// Shared helper — throws if not authenticated
const requireUserId = () => {
  const userId = getUserIdFromToken();
  if (!userId) throw new Error('User not authenticated');
  return userId;
};

// ---------------------------------------------------------------------------
// Summary endpoints
// ---------------------------------------------------------------------------

// Get total balance (income − expenses)
export const getTotalBalance = async () => {
  try {
    const userId = requireUserId();

    const response = await fetch(
      `${API_BASE_URL}/api/history/balance?user_id=${userId}`,
      { method: 'GET', headers: createHeaders() }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
};

// Get total income
export const getTotalIncome = async () => {
  try {
    const userId = requireUserId();

    const response = await fetch(
      `${API_BASE_URL}/api/history/income?user_id=${userId}`,
      { method: 'GET', headers: createHeaders() }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching income:', error);
    throw error;
  }
};

// Get total expenses
export const getTotalExpenses = async () => {
  try {
    const userId = requireUserId();

    const response = await fetch(
      `${API_BASE_URL}/api/history/expenses?user_id=${userId}`,
      { method: 'GET', headers: createHeaders() }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

// Get total savings
export const getTotalSavings = async () => {
  try {
    const userId = requireUserId();

    const response = await fetch(
      `${API_BASE_URL}/api/history/savings?user_id=${userId}`,
      { method: 'GET', headers: createHeaders() }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching savings:', error);
    throw error;
  }
};

// Get all summary figures in a single parallel fetch
export const getSummaryData = async () => {
  try {
    const userId = requireUserId();

    const [balanceRes, incomeRes, expensesRes, savingsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/history/balance?user_id=${userId}`, {
        method: 'GET',
        headers: createHeaders(),
      }),
      fetch(`${API_BASE_URL}/api/history/income?user_id=${userId}`, {
        method: 'GET',
        headers: createHeaders(),
      }),
      fetch(`${API_BASE_URL}/api/history/expenses?user_id=${userId}`, {
        method: 'GET',
        headers: createHeaders(),
      }),
      fetch(`${API_BASE_URL}/api/history/savings?user_id=${userId}`, {
        method: 'GET',
        headers: createHeaders(),
      }),
    ]);

    const [balanceData, incomeData, expensesData, savingsData] = await Promise.all([
      handleResponse(balanceRes),
      handleResponse(incomeRes),
      handleResponse(expensesRes),
      handleResponse(savingsRes),
    ]);

    return {
      totalBalance: balanceData.data?.balance ?? 0,
      totalIncome: incomeData.data?.total_income ?? 0,
      totalExpenses: expensesData.data?.total_expenses ?? 0,
      totalSavings: savingsData.data?.total_savings ?? 0,
    };
  } catch (error) {
    console.error('Error fetching summary data:', error);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Transaction endpoints
// ---------------------------------------------------------------------------

// Get recent transactions (last N days)
export const getRecentTransactions = async (days = 30, limit = 100) => {
  try {
    const userId = requireUserId();

    const params = new URLSearchParams({
      user_id: userId,
      days: days.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/history/transactions?${params.toString()}`,
      { method: 'GET', headers: createHeaders() }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// Get all transactions across all types (income, expense, savings) with optional date range
export const getAllTransactions = async (startDate, endDate, limit = 100) => {
  try {
    const userId = requireUserId();

    const params = new URLSearchParams({ user_id: userId, limit: limit.toString() });
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);

    const response = await fetch(
      `${API_BASE_URL}/api/history/transactions?${params.toString()}`,
      { method: 'GET', headers: createHeaders() }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    throw error;
  }
};

// Get transactions filtered by type with optional date range
// type: 'income' | 'expense' | 'savings'
export const getTransactionsByType = async (type, startDate, endDate, limit = 100) => {
  try {
    const userId = requireUserId();

    const params = new URLSearchParams({ user_id: userId, type, limit: limit.toString() });
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);

    const response = await fetch(
      `${API_BASE_URL}/api/history/transactions?${params.toString()}`,
      { method: 'GET', headers: createHeaders() }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching ${type} transactions:`, error);
    throw error;
  }
};

// Get transactions within a custom date range (all types)
export const getTransactionsDateRange = async (startDate, endDate, limit = 100) => {
  return getAllTransactions(startDate, endDate, limit);
};

// Get savings transactions within a date range (used by SavingsTargetCard)
export const getSavingsTransactionsDateRange = async (startDate, endDate, limit = 1000) => {
  return getTransactionsByType('savings', startDate, endDate, limit);
};

// Get all savings transactions without a date filter (used by SavingsSourcesCard)
export const getAllSavingsTransactions = async (limit = 1000) => {
  return getTransactionsByType('savings', null, null, limit);
};

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

export const checkHistoryServiceHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/history/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error checking service health:', error);
    throw error;
  }
};