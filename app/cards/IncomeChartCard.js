import React, { useEffect, useRef, useState } from 'react';
import * as Chart from 'chart.js';
import AddIncomeModal from './AddIncomeModal';

const IncomeChartCard = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [showModal, setShowModal] = useState(false);
  
  // Sample data - only includes days with income (no zero values)
  const [incomeData] = useState([
    { date: '2025-01-01', amount: 150 },
    { date: '2025-01-03', amount: 280 },
    { date: '2025-01-05', amount: 420 },
    { date: '2025-01-07', amount: 320 },
    { date: '2025-01-08', amount: 180 },
    { date: '2025-01-10', amount: 650 },
    { date: '2025-01-12', amount: 390 },
    { date: '2025-01-15', amount: 220 },
    { date: '2025-01-18', amount: 480 },
    { date: '2025-01-20', amount: 360 }
  ]);

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
    if (!chartRef.current) return;

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
                return `Income: $${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value;
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
            },
            
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

  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-shadow duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Income Overview</h2>
            <p className="text-sm text-gray-600 mt-1">
              Total: ${totalIncome.toFixed(2)} • {incomeData.length} days with income
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
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Modal */}
      <AddIncomeModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onAddIncome={(incomeData) => {
          console.log('New income data:', incomeData);
          // Here you can add logic to update your income data
          setShowModal(false);
        }}
      />
    </>
  );
};

export default IncomeChartCard;