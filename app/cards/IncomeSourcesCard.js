import React, { useState, useEffect } from 'react';
import { Download, Calendar } from 'lucide-react';
import { getTransactionsDateRange } from '../api/utils/historyAPI';
import * as XLSX from 'xlsx';

const IncomeSourcesCard = () => {
  const [incomeSources, setIncomeSources] = useState([]);
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

  // Fetch income sources for selected month
  const fetchIncomeSources = async () => {
    if (!selectedMonth || !selectedYear) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { startDate, endDate } = getMonthDateRange(selectedMonth, selectedYear);
      const data = await getTransactionsDateRange(startDate, endDate, 1000);
      
      // Filter only income and group by source/name
      const incomeTransactions = data.transactions?.filter(t => t.type === 'income') || [];
      
      // Group income by name and sum amounts
      const groupedIncome = incomeTransactions.reduce((acc, transaction) => {
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
      const incomeArray = Object.values(groupedIncome)
        .sort((a, b) => b.amount - a.amount)
        .map((source, index) => ({ ...source, id: index + 1 }));

      setIncomeSources(incomeArray);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching income sources:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when month/year changes
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchIncomeSources();
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
    if (incomeSources.length === 0) return;

    // Prepare data for Excel
    const excelData = incomeSources.map(source => ({
      'Source': source.name,
      'Amount': source.amount,
      'Transaction Count': source.count,
      'Formatted Amount': formatAmount(source.amount)
    }));

    // Add total row
    const totalAmount = incomeSources.reduce((sum, source) => sum + source.amount, 0);
    const totalCount = incomeSources.reduce((sum, source) => sum + source.count, 0);
    excelData.push({
      'Source': 'TOTAL',
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

    XLSX.utils.book_append_sheet(wb, ws, 'Income Sources');
    
    // Generate file name with selected month/year
    const monthName = monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth;
    const fileName = `income-sources-${monthName}-${selectedYear}.xlsx`;
    
    // Download file
    XLSX.writeFile(wb, fileName);
  };

  const calculateTotal = () => {
    return incomeSources.reduce((sum, source) => sum + source.amount, 0);
  };

  const getSelectedMonthName = () => {
    const month = monthOptions.find(m => m.value === selectedMonth);
    return month ? `${month.label} ${selectedYear}` : '';
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 transition-shadow duration-300 min-h-[400px] max-h-[600px] sm:h-96 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">Income Sources</h2>
          
          {/* Month/Year Selector */}
          <div className="flex items-center space-x-2 flex-wrap">
            <Calendar size={16} className="text-gray-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          disabled={incomeSources.length === 0}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          <span>Download</span>
        </button>
      </div>

      {/* Content Area with Scroll */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-green-500 text-center">
              <p>Error loading income sources</p>
              <p className="text-xs mt-1">{error}</p>
              <button 
                onClick={fetchIncomeSources}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Retry
              </button>
            </div>
          </div>
        ) : incomeSources.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-center">
              <p>No income sources found</p>
              <p className="text-xs mt-1">for {getSelectedMonthName()}</p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            {/* Scrollable Income Sources List */}
            <div className="px-6 py-2">
              <div className="grid grid-cols-1 gap-3">
                {incomeSources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150 border border-gray-100"
                  >
                    {/* Left side: Emoji and Title */}
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {source.emoji}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {source.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {source.count} transaction{source.count > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Right side: Amount */}
                    <div className="text-right">
                      <p className="font-semibold text-sm text-green-600">
                        +{formatAmount(source.amount)}
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
      {!loading && !error && incomeSources.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">💎</div>
              <div>
                <p className="font-bold text-gray-800">Total Income</p>
                <p className="text-xs text-gray-500">{getSelectedMonthName()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-green-600">
                +{formatAmount(calculateTotal())}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeSourcesCard;