import React from 'react';
import { Wallet, TrendingUp, TrendingDown, RefreshCw, Loader } from 'lucide-react';

function Summary({ data, loading, error, onRefresh }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const LoadingCard = () => (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-center h-[68px]">
        <Loader className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    </div>
  );

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
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
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.totalBalance)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Income Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(data.totalIncome)}
                  </p>
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
                    {formatCurrency(data.totalExpenses)}
                  </p>
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