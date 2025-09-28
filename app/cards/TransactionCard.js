import React, { useState, useEffect } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { getRecentTransactions, getTransactionsDateRange } from '../api/utils/historyAPI';

const TransactionCard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customDateMode, setCustomDateMode] = useState(false);

  // Period options
  const periodOptions = [
    { value: '7', label: '7 Days' },
    { value: '30', label: '30 Days' },
    { value: '60', label: '60 Days' },
    { value: '365', label: '1 Year' }
  ];

  // Helper function to get date range
  const getDateRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - parseInt(days));
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  // Fetch transactions based on period or date range
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      if (customDateMode && startDate && endDate) {
        data = await getTransactionsDateRange(startDate, endDate, 100);
      } else {
        data = await getRecentTransactions(parseInt(selectedPeriod), 100);
      }
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when period changes
  useEffect(() => {
    fetchTransactions();
  }, [selectedPeriod]);

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setCustomDateMode(false);
    setShowDatePicker(false);
  };

  // Handle custom date range
  const handleCustomDateRange = () => {
    if (startDate && endDate) {
      setCustomDateMode(true);
      fetchTransactions();
      setShowDatePicker(false);
    }
  };

  // Format amount
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 transition-shadow duration-300 lg:h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
        
        {/* Filter Controls */}
        <div className="flex items-center space-x-2 relative">
          {/* Period Filter */}
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Filter size={14} className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
          </div>

          {/* Custom Date Range Button */}
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center space-x-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Calendar size={14} />
          </button>
        </div>
      </div>

      {/* Custom Date Picker */}
      {showDatePicker && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleCustomDateRange}
              disabled={!startDate || !endDate}
              className="mt-5 bg-blue-600 text-white px-4 py-1 rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Transaction List with Scroll */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500 text-sm text-center">
              <p>Error loading transactions</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-center">
              <p>No transactions found</p>
              <p className="text-xs mt-1">Try adjusting your date range</p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-6 py-2">
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.transaction_id} 
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                >
                  {/* Left side: Emoji and Title */}
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {transaction.emoji || '💰'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {transaction.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>

                  {/* Right side: Amount */}
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${
                      transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'expense' ? '-' : '+'}{formatAmount(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer with count */}
      {!loading && !error && transactions.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            Showing {transactions.length} transactions
            {customDateMode && startDate && endDate && (
              <span> from {formatDate(startDate)} to {formatDate(endDate)}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;