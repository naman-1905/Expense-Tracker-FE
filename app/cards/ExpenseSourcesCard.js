import React from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const ExpensesCard = () => {
  // Sample expenses data
  const expenses = [
    {
      id: 1,
      emoji: '🏠',
      title: 'Rent/Mortgage',
      amount: 1500.00,
      frequency: 'Monthly'
    },
    {
      id: 2,
      emoji: '🛒',
      title: 'Groceries',
      amount: 500.00,
      frequency: 'Monthly'
    },
    {
      id: 3,
      emoji: '🚗',
      title: 'Transportation',
      amount: 300.00,
      frequency: 'Monthly'
    },
    {
      id: 4,
      emoji: '⚡',
      title: 'Utilities',
      amount: 200.00,
      frequency: 'Monthly'
    },
    {
      id: 5,
      emoji: '📱',
      title: 'Phone & Internet',
      amount: 100.00,
      frequency: 'Monthly'
    },
    {
      id: 6,
      emoji: '💊',
      title: 'Healthcare',
      amount: 250.00,
      frequency: 'Monthly'
    },
    {
      id: 7,
      emoji: '🎉',
      title: 'Entertainment',
      amount: 150.00,
      frequency: 'Monthly'
    },
    {
      id: 8,
      emoji: '🎓',
      title: 'Education',
      amount: 400.00,
      frequency: 'Monthly'
    }
  ];

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const downloadExcel = () => {
    // Prepare data for Excel
    const excelData = expenses.map(expense => ({
      'Category': expense.title,
      'Amount': expense.amount,
      'Frequency': expense.frequency,
      'Formatted Amount': formatAmount(expense.amount)
    }));

    // Add total row
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    excelData.push({
      'Category': 'TOTAL',
      'Amount': totalAmount,
      'Frequency': '',
      'Formatted Amount': formatAmount(totalAmount)
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();

    // Set column widths
    ws['!cols'] = [
      { width: 20 },
      { width: 12 },
      { width: 12 },
      { width: 15 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

    // Generate file name with current date
    const date = new Date().toISOString().split('T')[0];
    const fileName = `expenses-${date}.xlsx`;

    // Download file
    XLSX.writeFile(wb, fileName);
  };

  const calculateTotal = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-shadow duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
        <button
          onClick={downloadExcel}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
        >
          <Download size={16} />
          <span>Download</span>
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150 border border-gray-100"
          >
            {/* Left side: Emoji and Title */}
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {expense.emoji}
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  {expense.title}
                </p>
                <p className="text-xs text-gray-500">
                  {expense.frequency}
                </p>
              </div>
            </div>

            {/* Right side: Amount */}
            <div className="text-right">
              <p className="font-semibold text-sm text-red-600">
                -{formatAmount(expense.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Total Section */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📉</div>
            <div>
              <p className="font-bold text-gray-800">Total Monthly Expenses</p>
              <p className="text-xs text-gray-500">Combined categories</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-red-600">
              -{formatAmount(calculateTotal())}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesCard;