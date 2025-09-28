
import { useState, useEffect, useCallback } from 'react';
import { getSummaryData } from '../api/utils/historyAPI';

export const useSummary = (autoRefresh = false, refreshInterval = 30000) => {
  const [data, setData] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const summaryData = await getSummaryData();
      setData(summaryData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to fetch summary data');
      console.error('Summary fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdated
  };
};