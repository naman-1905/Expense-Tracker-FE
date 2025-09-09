import React, { useEffect, useRef, useState } from 'react';
import * as Chart from 'chart.js';
import AddExpenseModal from './AddExpenseModal'; // you'll need to create this modal

const ExpenseChartCard = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [showModal, setShowModal] = useState(false);

  // Sample expense data
  const [expenseData, setExpenseData] = useState([
    { date: '2025-01-01', amount: 90 },
    { date: '2025-01-04', amount: 200 },
    { date: '2025-01-06', amount: 130 },
    { date: '2025-01-09', amount: 250 },
    { date: '2025-01-11', amount: 170 },
    { date: '2025-01-14', amount: 300 },
    { date: '2025-01-16', amount: 220 },
    { date: '2025-01-19', amount: 150 },
    { date: '2025-01-22', amount: 280 },
    { date: '2025-01-25', amount: 190 }
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
              label: (context) => `Expense: $${context.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#6b7280',
              font: { size: 14 },
              callback: (value) => `$${value}`
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

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-shadow duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Expense Overview</h2>
            <p className="text-sm text-gray-600 mt-1">
              Total: ${totalExpenses.toFixed(2)} • {expenseData.length} expense days
            </p>
          </div>
          <button
            onClick={handleAddExpense}
            className="bg-red-600/60 hover:bg-red-600 cursor-pointer text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm"
          >
            <span className="text-lg">+</span>
            Add Expense
          </button>
        </div>

        {/* Chart Container */}
        <div className="relative" style={{ height: '400px' }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Modal */}
      <AddExpenseModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onAddExpense={(expense) => {
          // Example: update expenseData with new entry
          setExpenseData(prev => [...prev, expense]);
          setShowModal(false);
        }}
      />
    </>
  );
};

export default ExpenseChartCard;
