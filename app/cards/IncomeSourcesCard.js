import React from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const IncomeSourcesCard = () => {
  // Sample income sources data
  const incomeSources = [
    {
      id: 1,
      emoji: '💼',
      title: 'Full-time Job',
      amount: 5000.00,
      frequency: 'Monthly'
    },
    {
      id: 2,
      emoji: '🏠',
      title: 'Rental Property',
      amount: 1200.00,
      frequency: 'Monthly'
    },
    {
      id: 3,
      emoji: '💻',
      title: 'Freelance Work',
      amount: 800.00,
      frequency: 'Monthly'
    },
    {
      id: 4,
      emoji: '📈',
      title: 'Stock Dividends',
      amount: 150.00,
      frequency: 'Quarterly'
    },
    {
      id: 5,
      emoji: '🎨',
      title: 'Art Sales',
      amount: 300.00,
      frequency: 'Monthly'
    },
    {
      id: 6,
      emoji: '📚',
      title: 'Online Courses',
      amount: 450.00,
      frequency: 'Monthly'
    },
    {
      id: 7,
      emoji: '🚗',
      title: 'Ride Sharing',
      amount: 600.00,
      frequency: 'Monthly'
    },
    {
      id: 8,
      emoji: '💰',
      title: 'Interest Income',
      amount: 75.00,
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
    const excelData = incomeSources.map(source => ({
      'Source': source.title,
      'Amount': source.amount,
      'Frequency': source.frequency,
      'Formatted Amount': formatAmount(source.amount)
    }));

    // Add total row
    const totalAmount = incomeSources.reduce((sum, source) => sum + source.amount, 0);
    excelData.push({
      'Source': 'TOTAL',
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

    XLSX.utils.book_append_sheet(wb, ws, 'Income Sources');
    
    // Generate file name with current date
    const date = new Date().toISOString().split('T')[0];
    const fileName = `income-sources-${date}.xlsx`;
    
    // Download file
    XLSX.writeFile(wb, fileName);
  };

  const calculateTotal = () => {
    return incomeSources.reduce((sum, source) => sum + source.amount, 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-shadow duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Income Sources</h2>
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
                  {source.title}
                </p>
                <p className="text-xs text-gray-500">
                  {source.frequency}
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

      {/* Total Section */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">💎</div>
            <div>
              <p className="font-bold text-gray-800">Total Monthly Income</p>
              <p className="text-xs text-gray-500">Combined sources</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-green-600">
              +{formatAmount(calculateTotal())}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeSourcesCard;