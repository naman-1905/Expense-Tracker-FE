import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { Loader, RefreshCw, AlertCircle } from 'lucide-react';
import { getSummaryData } from '../api/utils/historyAPI';

function FinanceOverview() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  // Initialize from localStorage if available
  const getCachedData = () => {
    try {
      const cached = localStorage.getItem('financialOverviewData');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error('Error reading from localStorage:', err);
    }
    return null;
  };

  const cachedData = getCachedData();
  const [loading, setLoading] = useState(!cachedData); // Only load if no cached data
  const [error, setError] = useState(null);
  const [financialData, setFinancialData] = useState(cachedData || {
    totalIncome: 0,
    totalExpenses: 0,
    totalBalance: 0,
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchFinancialData = async () => {
    try {
      setError(null);
      
      const summaryData = await getSummaryData();
      setFinancialData(summaryData);
      setLastUpdated(new Date());
      
      // Save to localStorage
      try {
        localStorage.setItem('financialOverviewData', JSON.stringify(summaryData));
      } catch (err) {
        console.error('Error saving to localStorage:', err);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch financial data');
      console.error('Finance Overview fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchFinancialData();
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value));

  useEffect(() => {
    if (loading || error) return;

    const ctx = chartRef.current?.getContext('2d');
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const createGradient = (ctx, color1, color2) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      return gradient;
    };

    const incomeGradient = createGradient(ctx, '#10B981', '#059669');
    const expensesGradient = createGradient(ctx, '#EF4444', '#DC2626');

    // Prepare data for chart - only show income and expenses for meaningful visualization
    const chartData = [];
    const chartLabels = [];
    const chartColors = [];

    if (financialData.totalIncome > 0) {
      chartData.push(financialData.totalIncome);
      chartLabels.push('Income');
      chartColors.push(incomeGradient);
    }

    if (financialData.totalExpenses > 0) {
      chartData.push(financialData.totalExpenses);
      chartLabels.push('Expenses');
      chartColors.push(expensesGradient);
    }

    // If no data, show placeholder
    if (chartData.length === 0) {
      chartData.push(1);
      chartLabels.push('No Data');
      chartColors.push('#E5E7EB');
    }

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [
          {
            data: chartData,
            backgroundColor: chartColors,
            borderWidth: 2,
            borderColor: chartColors.map(color => 
              typeof color === 'string' ? color : 'rgba(255, 255, 255, 0.1)'
            ),
            cutout: '70%',
            spacing: 4,
            borderRadius: 8,
            hoverBorderWidth: 4,
            hoverBorderColor: 'rgba(255, 255, 255, 0.9)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            cornerRadius: 12,
            displayColors: true,
            padding: 16,
            titleFont: { size: 16, weight: '600' },
            bodyFont: { size: 14, weight: '500' },
            titleAlign: 'center',
            bodyAlign: 'center',
            caretSize: 8,
            caretPadding: 15,
            usePointStyle: true,
            boxWidth: 12,
            boxHeight: 12,
            boxPadding: 8,
            callbacks: {
              title: function(context) {
                return context[0].label;
              },
              label: function (context) {
                const value = context.parsed;
                const percentage = ((value / chartData.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                return [formatCurrency(value), `${percentage}% of total`];
              },
              labelColor: function(context) {
                const colors = ['#10B981', '#EF4444', '#3B82F6'];
                return {
                  borderColor: colors[context.dataIndex] || '#E5E7EB',
                  backgroundColor: colors[context.dataIndex] || '#E5E7EB',
                  borderWidth: 0,
                  borderRadius: 6,
                };
              },
            },
            animation: {
              duration: 200,
            },
            position: 'nearest',
          },
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1200,
          easing: 'easeOutCubic',
        },
        elements: {
          arc: { 
            borderWidth: 2, 
            hoverBorderWidth: 4,
            hoverBorderColor: 'rgba(255, 255, 255, 0.9)',
          },
        },
        interaction: { 
          intersect: false,
          mode: 'point'
        },
        onHover: (event, activeElements) => {
          if (activeElements.length > 0) {
            event.native.target.style.cursor = 'pointer';
          } else {
            event.native.target.style.cursor = 'default';
          }
        },
      },
    });

    return () => {
      chartInstance.current?.destroy();
    };
  }, [loading, error, financialData.totalIncome, financialData.totalExpenses]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100/50 backdrop-blur-sm min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading financial overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100/50 backdrop-blur-sm min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to Load Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const netWorth = financialData.totalBalance;
  const savingsRate = financialData.totalIncome > 0 
    ? ((netWorth / financialData.totalIncome) * 100) 
    : 0;
  const expenseRatio = financialData.totalIncome > 0 
    ? ((financialData.totalExpenses / financialData.totalIncome) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Financial Overview
          </h2>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative mb-8">
        <div className="w-full h-80 relative">
          <canvas ref={chartRef} className="absolute inset-0"></canvas>

          {/* Center Content */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 mb-1">
                Net Balance
              </p>
              <p className={`text-3xl font-bold ${
                netWorth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(netWorth)}
              </p>
              <p className={`text-xs mt-1 ${
                netWorth >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {netWorth >= 0 ? 'Surplus' : 'Deficit'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-8">
          {financialData.totalIncome > 0 && (
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Income</span>
            </div>
          )}
          {financialData.totalExpenses > 0 && (
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-red-600 mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Expenses</span>
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Income Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-100">
          <div className="text-center">
            <p className="text-sm font-medium text-green-600/80 mb-1">Total Income</p>
            <p className="text-xl font-bold text-green-700">
              {formatCurrency(financialData.totalIncome)}
            </p>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-100">
          <div className="text-center">
            <p className="text-sm font-medium text-red-600/80 mb-1">Total Expenses</p>
            <p className="text-xl font-bold text-red-700">
              {formatCurrency(financialData.totalExpenses)}
            </p>
          </div>
        </div>

        {/* Balance Card */}
        <div className={`p-4 rounded-xl border ${
          netWorth >= 0 
            ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-100' 
            : 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-100'
        }`}>
          <div className="text-center">
            <p className={`text-sm font-medium mb-1 ${
              netWorth >= 0 ? 'text-blue-600/80' : 'text-red-600/80'
            }`}>
              Net Balance
            </p>
            <p className={`text-xl font-bold ${
              netWorth >= 0 ? 'text-blue-700' : 'text-red-700'
            }`}>
              {formatCurrency(netWorth)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="pt-6 border-t border-gray-200/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`text-center p-4 rounded-2xl ${
            savingsRate >= 0 
              ? 'bg-gradient-to-br from-green-50 to-green-100/50' 
              : 'bg-gradient-to-br from-red-50 to-red-100/50'
          }`}>
            <p className={`text-sm font-medium mb-1 ${
              savingsRate >= 0 ? 'text-green-600/80' : 'text-red-600/80'
            }`}>
              Savings Rate
            </p>
            <p className={`text-xl font-bold ${
              savingsRate >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {savingsRate.toFixed(1)}%
            </p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50">
            <p className="text-sm font-medium text-orange-600/80 mb-1">
              Expense Ratio
            </p>
            <p className="text-xl font-bold text-orange-700">
              {expenseRatio.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Future Upgrade, Insights with AI model */}
      {/* Additional Insights
      {(financialData.totalIncome > 0 || financialData.totalExpenses > 0) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Financial Health</h4>
          <div className="text-sm text-gray-600">
            {netWorth >= 0 ? (
              <p>✅ You're maintaining a positive balance. Keep up the good work!</p>
            ) : (
              <p>⚠️ You're spending more than you're earning. Consider reviewing your expenses.</p>
            )}
          </div>
        </div>
      )} */}
    </div>
  );
}

export default FinanceOverview;