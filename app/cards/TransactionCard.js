import React from 'react';

const TransactionCard = () => {
  // Sample transaction data
  const transactions = [
    {
      id: 1,
      emoji: '🛒',
      title: 'Grocery Shopping',
      amount: -85.50,
      date: '2025-09-08'
    },
    {
      id: 2,
      emoji: '💰',
      title: 'Salary Deposit',
      amount: 3200.00,
      date: '2025-09-07'
    },
    {
      id: 3,
      emoji: '☕',
      title: 'Coffee Shop',
      amount: -4.25,
      date: '2025-09-07'
    },
    {
      id: 4,
      emoji: '🚗',
      title: 'Gas Station',
      amount: -65.00,
      date: '2025-09-06'
    },
    {
      id: 5,
      emoji: '📱',
      title: 'Mobile Bill',
      amount: -45.99,
      date: '2025-09-05'
    },
    {
      id: 6,
      emoji: '🎬',
      title: 'Movie Tickets',
      amount: -28.50,
      date: '2025-09-04'
    },
    {
      id: 7,
      emoji: '💳',
      title: 'Cashback Reward',
      amount: 15.75,
      date: '2025-09-03'
    }
  ];

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transition-shadow duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Recent Transactions</h2>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150"
          >
            {/* Left side: Emoji and Title */}
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {transaction.emoji}
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  {transaction.title}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(transaction.date)}
                </p>
              </div>
            </div>

            {/* Right side: Amount */}
            <div className="text-right">
              <p className={`font-semibold text-sm ${
                transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {transaction.amount < 0 ? '-' : '+'}{formatAmount(transaction.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionCard;