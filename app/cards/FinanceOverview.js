import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function FinanceOverview() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Sample data - replace with your actual data
  const financialData = {
    income: 23750,
    expenses: 8320,
    balance: 15430,
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

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
    const balanceGradient = createGradient(ctx, '#3B82F6', '#2563EB');

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Income', 'Expenses', 'Balance'], // keep labels internally
        datasets: [
          {
            data: [
              financialData.income,
              financialData.expenses,
              financialData.balance,
            ],
            backgroundColor: [incomeGradient, expensesGradient, balanceGradient],
            borderWidth: 0,
            cutout: '70%',
            spacing: 4,
            borderRadius: 8,
            hoverBorderWidth: 0,
            hoverBorderColor: 'transparent',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }, // hide legend completely
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#374151',
            bodyColor: '#6B7280',
            borderColor: '#E5E7EB',
            borderWidth: 1,
            cornerRadius: 12,
            displayColors: false,
            padding: 12,
            titleFont: { size: 14, weight: '600' },
            bodyFont: { size: 13, weight: '500' },
            callbacks: {
              label: function (context) {
                const label = context.label; // "Income", "Expenses", "Balance"
                const value = context.parsed;
                return `${label}: ${formatCurrency(value)}`;
              },
            },
          },
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1500,
          easing: 'easeOutCubic',
        },
        elements: {
          arc: { borderWidth: 0, hoverBorderWidth: 0 },
        },
        interaction: { intersect: false },
      },
    });

    return () => {
      chartInstance.current?.destroy();
    };
  }, [financialData.income, financialData.expenses, financialData.balance]);

  return (
    <div className="bg-white rounded-3xl shadow-md p-8 border border-gray-100/50 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Financial Overview
        </h2>
        <p className="text-gray-500">Your financial breakdown at a glance</p>
      </div>

      {/* Chart Container */}
      <div className="relative mb-8">
        <div className="w-full h-80 relative">
          <canvas ref={chartRef} className="absolute inset-0"></canvas>

          {/* Center Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 mb-1">
                Net Worth
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {formatCurrency(financialData.income - financialData.expenses)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200/50">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50">
            <p className="text-sm font-medium text-green-600/80 mb-1">
              Savings Rate
            </p>
            <p className="text-xl font-bold text-green-700">
              {((financialData.balance / financialData.income) * 100).toFixed(1)}
              %
            </p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50">
            <p className="text-sm font-medium text-blue-600/80 mb-1">
              Expense Ratio
            </p>
            <p className="text-xl font-bold text-blue-700">
              {((financialData.expenses / financialData.income) * 100).toFixed(
                1
              )}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinanceOverview;
