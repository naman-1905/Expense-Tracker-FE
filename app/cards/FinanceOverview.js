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
        labels: ['Income', 'Expenses', 'Balance'],
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
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            cornerRadius: 8,
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
                return formatCurrency(value);
              },
              labelColor: function(context) {
                const colors = ['#10B981', '#EF4444', '#3B82F6'];
                return {
                  borderColor: colors[context.dataIndex],
                  backgroundColor: colors[context.dataIndex],
                  borderWidth: 0,
                  borderRadius: 6,
                };
              },
            },
            animation: {
              duration: 200,
            },
            position: 'average',
            external: function(context) {
              // Get tooltip, chart, and canvas references
              const {chart, tooltip} = context;
              const canvas = chart.canvas;
              
              if (tooltip.opacity === 0) return;
              
              // Get the center of the chart
              const centerX = chart.width / 2;
              const centerY = chart.height / 2;
              
              // Get the tooltip position relative to the center
              const tooltipX = tooltip.caretX;
              const tooltipY = tooltip.caretY;
              
              // Calculate the direction from center to hover point
              const deltaX = tooltipX - centerX;
              const deltaY = tooltipY - centerY;
              
              // Calculate the distance and normalize
              const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
              const normalizedX = deltaX / distance;
              const normalizedY = deltaY / distance;
              
              // Position tooltip outside the circle (radius ~140px, tooltip offset ~180px)
              const offset = 180;
              const newX = centerX + normalizedX * offset;
              const newY = centerY + normalizedY * offset;
              
              // Update tooltip position
              tooltip.x = newX;
              tooltip.y = newY;
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
          arc: { 
            borderWidth: 0, 
            hoverBorderWidth: 3,
            hoverBorderColor: 'rgba(255, 255, 255, 0.8)',
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
  }, [financialData.income, financialData.expenses, financialData.balance]);

  return (
    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100/50 backdrop-blur-sm">
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
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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

      {/* Legend */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-8">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 mr-3"></div>
            <span className="text-sm font-medium text-gray-700">Income</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-red-600 mr-3"></div>
            <span className="text-sm font-medium text-gray-700">Expenses</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 mr-3"></div>
            <span className="text-sm font-medium text-gray-700">Balance</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="pt-6 border-t border-gray-200/50">
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