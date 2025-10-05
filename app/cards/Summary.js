import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, RefreshCw, Loader, AlertCircle } from 'lucide-react';
import { getSummaryData } from '../api/utils/historyAPI';
import { useCurrency } from '../context/CurrencyContext';

function Summary() {
  const [data, setData] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { formatAmount } = useCurrency();

  const fetchSummaryData = async () => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      setError(null);
      
      const cachedData = localStorage.getItem('summaryData');
      if (cachedData) {
        setData(JSON.parse(cachedData));
        setLoading(false);
      }
      
      const summaryData = await getSummaryData();
      setData(summaryData);
      
      localStorage.setItem('summaryData', JSON.stringify(summaryData));
      
      setIsInitialLoad(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch summary data');
      console.error('Summary fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSummaryData();
  };

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const LoadingCard = () => (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-center h-[68px]">
        <Loader className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    </div>
  );

  const ErrorCard = ({ message }) => (
    <div className="bg-red-50 rounded-2xl shadow-sm p-6 border border-red-200">
      <div className="flex items-center justify-center h-[68px] flex-col space-y-2">
        <AlertCircle className="w-6 h-6 text-red-500" />
        <p className="text-sm text-red-600 text-center">{message}</p>
      </div>
    </div>
  );

  if (error && !loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Financial Summary</h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ErrorCard message={error} />
          <ErrorCard message={error} />
          <ErrorCard message={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Financial Summary</h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        ) : (
          <>
            {/* Balance Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Balance</p>
                  <p className={`text-2xl font-bold ${
                    data.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatAmount(data.totalBalance)}
                  </p>
                  {data.totalBalance < 0 && (
                    <p className="text-xs text-red-500 mt-1">Deficit</p>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  data.totalBalance >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Wallet className={`w-6 h-6 ${
                    data.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
            </div>

            {/* Income Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatAmount(data.totalIncome)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">All time</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Expenses Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatAmount(data.totalExpenses)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">All time</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Summary;