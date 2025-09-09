import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

function Summary() {
  // Sample data - replace with your actual data
  const financialData = {
    totalBalance: 15430.50,
    totalIncome: 23750.00,
    totalExpenses: 8319.50
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Balance Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(financialData.totalBalance)}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Total Income Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Income</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(financialData.totalIncome)}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(financialData.totalExpenses)}
            </p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Summary;