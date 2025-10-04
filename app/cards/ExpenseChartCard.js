import React, { useEffect, useRef, useState } from 'react';
import * as Chart from 'chart.js';
import { getRecentTransactions } from '../api/utils/historyAPI';
import AddExpenseModal from './AddExpenseModal';

const ExpenseChartCard = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch expense data for the last 10 days
  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load cached data first
      const cachedData = localStorage.getItem('expenseChartData');
      if (cachedData) {
        setExpenseData(JSON.parse(cachedData));
        setLoading(false);
      }
      
      // Fetch fresh data in background
      const data = await getRecentTransactions(10, 100);
      
      // Filter only expenses and group by date
      const expenses = data.transactions?.filter(t => t.type === 'expense') || [];
      
      // Group expenses by date
      const groupedByDate = expenses.reduce((acc, transaction) => {
        const date = transaction.date.split('T')[0]; // Get just the date part
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += transaction.amount;
        return acc;
      }, {});

      // Convert to array format and sort by date
      const chartData = Object.entries(groupedByDate)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setExpenseData(chartData);
      
      // Cache the fresh data
      localStorage.setItem('expenseChartData', JSON.stringify(chartData));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching expense data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchExpenseData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                   day === 2 || day === 22 ? 'nd' :
                   day === 3 || day === 23 ? 'rd' : 'th';
    
    return `${day}${suffix} ${month}`;
  };

  useEffect(() => {
    if (!chartRef.current || expenseData.length === 0) return;

    Chart.Chart.register(
      Chart.CategoryScale,
      Chart.LinearScale,
      Chart.LineElement,
      Chart.PointElement,
      Chart.Title,
      Chart.Tooltip,
      Chart.Legend
    );

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    chartInstance.current = new Chart.Chart(ctx, {
      type: 'line',
      data: {
        labels: expenseData.map(item => formatDate(item.date)),
        datasets: [{
          label: 'Daily Expenses',
          data: expenseData.map(item => item.amount),
          fill: false,
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          tension: 0.3,
          pointBackgroundColor: 'rgba(239, 68, 68, 1)',
          pointBorderColor: '#fff',
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1,
            callbacks: {
              label: (context) => `Expense: ₹${context.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#6b7280',
              font: { size: 14 },
              callback: (value) => `₹${value}`
            },
            grid: { color: 'rgba(229, 231, 235, 0.5)' },
            border: { display: false },
            title: {
              display: true,
              text: 'Amount',
              color: '#374151',
              font: { size: 14, weight: 'bold' }
            }
          },
          x: {
            ticks: {
              color: '#6b7280',
              maxRotation: 45,
              minRotation: 0,
              font: { size: 14 }
            },
            grid: { color: 'rgba(229, 231, 235, 0.3)' },
            border: { display: false }
          }
        },
        interaction: {
          intersect: false,
          mode: 'nearest'
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [expenseData]);

  const handleAddExpense = () => {
    setShowModal(true);
  };

  const handleExpenseAdded = () => {
    // Refresh data when new expense is added
    fetchExpenseData();
    setShowModal(false);
  };

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);

  if (loading && expenseData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-shadow duration-300 h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error && expenseData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-shadow duration-300 h-96 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p>Error loading expense data</p>
          <p className="text-xs mt-1">{error}</p>
          <button 
            onClick={fetchExpenseData}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-shadow duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Expense Overview</h2>
            <p className="text-sm text-gray-600 mt-1">
              {expenseData.length > 0 ? (
                <>Total: ₹{totalExpenses.toFixed(2)} • Last {expenseData.length} days with expenses</>
              ) : (
                'No expenses in the last 10 days'
              )}
            </p>
          </div>
          <button
            onClick={handleAddExpense}
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm"
          >
            <span className="text-lg">+</span>
            Add Expense
          </button>
        </div>

        {/* Chart Container */}
        <div className="relative" style={{ height: '400px' }}>
          {expenseData.length > 0 ? (
            <canvas ref={chartRef}></canvas>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">📊</p>
                <p>No expense data to display</p>
                <p className="text-xs">Add some expenses to see the chart</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddExpenseModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onAddExpense={handleExpenseAdded}
      />
    </>
  );
};

export default ExpenseChartCard;