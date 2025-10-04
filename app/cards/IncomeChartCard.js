import React, { useEffect, useRef, useState } from 'react';
import * as Chart from 'chart.js';
import { getRecentTransactions } from '../api/utils/historyAPI';
import AddIncomeModal from './AddIncomeModal';

const IncomeChartCard = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch income data for the last 10 days
  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load cached data first
      const cachedData = localStorage.getItem('incomeChartData');
      if (cachedData) {
        setIncomeData(JSON.parse(cachedData));
        setLoading(false);
      }
      
      // Fetch fresh data in background
      const data = await getRecentTransactions(10, 100);
      
      // Filter only income and group by date
      const incomes = data.transactions?.filter(t => t.type === 'income') || [];
      
      // Group income by date
      const groupedByDate = incomes.reduce((acc, transaction) => {
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

      setIncomeData(chartData);
      
      // Cache the fresh data
      localStorage.setItem('incomeChartData', JSON.stringify(chartData));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching income data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchIncomeData();
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
    if (!chartRef.current || incomeData.length === 0) return;

    // Register Chart.js components
    Chart.Chart.register(
      Chart.CategoryScale,
      Chart.LinearScale,
      Chart.BarElement,
      Chart.Title,
      Chart.Tooltip,
      Chart.Legend
    );

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    chartInstance.current = new Chart.Chart(ctx, {
      type: 'bar',
      data: {
        labels: incomeData.map(item => formatDate(item.date)),
        datasets: [{
          label: 'Daily Income',
          data: incomeData.map(item => item.amount),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return `Income: ₹${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return `₹${value}`;
              },
              color: '#6b7280',
              font: {
                size: 14
              }
            },
            grid: {
              color: 'rgba(229, 231, 235, 0.5)'
            },
            border: {
              display: false
            },
            title: {
              display: true,
              text: 'Amount',
              color: '#374151',
              font: {
                size: 14,
                weight: 'bold'
              }
            }
          },
          x: {
            ticks: {
              color: '#6b7280',
              maxRotation: 45,
              minRotation: 0,
              font: {
                size: 14
              }
            },
            grid: {
              color: 'rgba(229, 231, 235, 0.3)'
            },
            border: {
              display: false
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [incomeData]);

  const handleAddIncome = () => {
    setShowModal(true);
  };

  const handleIncomeAdded = () => {
    // Refresh data when new income is added
    fetchIncomeData();
    setShowModal(false);
  };

  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);

  if (loading && incomeData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-shadow duration-300 h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && incomeData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-shadow duration-300 h-96 flex items-center justify-center">
        <div className="text-blue-500 text-center">
          <p>Error loading income data</p>
          <p className="text-xs mt-1">{error}</p>
          <button 
            onClick={fetchIncomeData}
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
            <h2 className="text-2xl font-bold text-gray-800">Income Overview</h2>
            <p className="text-sm text-gray-600 mt-1">
              {incomeData.length > 0 ? (
                <>Total: ₹{totalIncome.toFixed(2)} • Last {incomeData.length} days with income</>
              ) : (
                'No income added in the last 10 days'
              )}
            </p>
          </div>
          <button
            onClick={handleAddIncome}
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm"
          >
            <span className="text-lg">+</span>
            Add Income
          </button>
        </div>

        {/* Chart Container */}
        <div className="relative" style={{ height: '400px' }}>
          {incomeData.length > 0 ? (
            <canvas ref={chartRef}></canvas>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <p className='font-bold'>No income data to display</p>
                <p className="text-xs">Add some income to see the chart</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddIncomeModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onAddIncome={handleIncomeAdded}
      />
    </>
  );
};

export default IncomeChartCard;