import React, { useState, useEffect } from 'react';
import { Download, Calendar } from 'lucide-react';
import { getTransactionsDateRange } from '../api/utils/historyAPI';
import * as XLSX from 'xlsx';

const ExpensesCard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Initialize with current month/year
  useEffect(() => {
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYear = String(now.getFullYear());
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  }, []);

  // Generate year options (current year and past 5 years)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  };

  // Month options
  const monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Get date range for selected month/year
  const getMonthDateRange = (month, year) => {
    const startDate = `${year}-${month}-01`;
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    const endDateStr = `${year}-${month}-${String(endDate.getDate()).padStart(2, '0')}`;
    return { startDate, endDate: endDateStr };
  };

  // Get cache key for current selection
  const getCacheKey = () => {
    return `expensesData_${selectedYear}_${selectedMonth}`;
  };

  // Fetch expenses for selected month
  const fetchExpenses = async () => {
    if (!selectedMonth || !selectedYear) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load cached data first
      const cacheKey = getCacheKey();
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        setExpenses(JSON.parse(cachedData));
        setLoading(false);
      }
      
      // Fetch fresh data in background
      const { startDate, endDate } = getMonthDateRange(selectedMonth, selectedYear);
      const data = await getTransactionsDateRange(startDate, endDate, 1000);
      
      // Filter only expenses and group by category/name
      const expenseTransactions = data.transactions?.filter(t => t.type === 'expense') || [];
      
      // Group expenses by name and sum amounts
      const groupedExpenses = expenseTransactions.reduce((acc, transaction) => {
        const key = transaction.name;
        if (!acc[key]) {
          acc[key] = {
            name: transaction.name,
            emoji: transaction.emoji || '💰',
            amount: 0,
            count: 0
          };
        }
        acc[key].amount += transaction.amount;
        acc[key].count += 1;
        return acc;
      }, {});

      // Convert to array and sort by amount (highest first)
      const expensesArray = Object.values(groupedExpenses)
        .sort((a, b) => b.amount - a.amount)
        .map((expense, index) => ({ ...expense, id: index + 1 }));

      setExpenses(expensesArray);
      
      // Cache the fresh data
      localStorage.setItem(cacheKey, JSON.stringify(expensesArray));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when month/year changes
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchExpenses();
    }
  }, [selectedMonth, selectedYear]);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const downloadExcel = () => {
    if (expenses.length === 0) return;

    // Prepare data for Excel
    const excelData = expenses.map(expense => ({
      'Category': expense.name,
      'Amount': expense.amount,
      'Transaction Count': expense.count,
      'Formatted Amount': formatAmount(expense.amount)
    }));

    // Add total row
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalCount = expenses.reduce((sum, expense) => sum + expense.count, 0);
    excelData.push({
      'Category': 'TOTAL',
      'Amount': totalAmount,
      'Transaction Count': totalCount,
      'Formatted Amount': formatAmount(totalAmount)
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();

    // Set column widths
    ws['!cols'] = [
      { width: 25 },
      { width: 15 },
      { width: 18 },
      { width: 18 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

    // Generate file name with selected month/year
    const monthName = monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth;
    const fileName = `expenses-${monthName}-${selectedYear}.xlsx`;

    // Download file
    XLSX.writeFile(wb, fileName);
  };

  const calculateTotal = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getSelectedMonthName = () => {
    const month = monthOptions.find(m => m.value === selectedMonth);
    return month ? `${month.label} ${selectedYear}` : '';
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 transition-shadow duration-300 min-h-[400px] max-h-[600px] sm:h-96 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 pb-4 border-b border-gray-100">
        <div className="w-full sm:w-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-3 sm:mb-3">Expenses</h2>
          
          {/* Month/Year Selector */}
          <div className="flex items-center gap-2 sm:gap-2">
            <Calendar size={16} className="text-gray-400 flex-shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none"
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none"
            >
              {generateYearOptions().map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={downloadExcel}
          disabled={expenses.length === 0}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
        >
          <Download size={16} />
          <span>Download</span>
        </button>
      </div>

      {/* Content Area with Scroll */}
      <div className="flex-1 overflow-hidden">
        {loading && expenses.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : error && expenses.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500 text-center">
              <p>Error loading expenses</p>
              <p className="text-xs mt-1">{error}</p>
              <button 
                onClick={fetchExpenses}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Retry
              </button>
            </div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-center">
              <p className='font-bold'>No expenses found</p>
              <p className="text-xs mt-1">for {getSelectedMonthName()}</p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            {/* Scrollable Expenses List */}
            <div className="px-6 py-2">
              <div className="grid grid-cols-1 gap-3">
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
                          {expense.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {expense.count} transaction{expense.count > 1 ? 's' : ''}
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
            </div>
          </div>
        )}
      </div>

      {/* Total Section - Fixed at bottom */}
      {!loading && !error && expenses.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📉</div>
              <div>
                <p className="font-bold text-gray-800">Total Expenses</p>
                <p className="text-xs text-gray-500">{getSelectedMonthName()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-red-600">
                -{formatAmount(calculateTotal())}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesCard;