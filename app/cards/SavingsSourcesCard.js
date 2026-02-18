import React, { useState, useEffect } from 'react';
import { PiggyBank, Download } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import * as XLSX from 'xlsx';

const DUMMY_SAVINGS = [
  { name: 'Emergency Fund', emoji: '🏦', amount: 5000, count: 4 },
  { name: 'Vacation Fund', emoji: '✈️', amount: 3200, count: 6 },
  { name: 'Retirement', emoji: '🌴', amount: 8500, count: 12 },
  { name: 'New Car', emoji: '🚗', amount: 2100, count: 3 },
  { name: 'Home Down Payment', emoji: '🏠', amount: 12000, count: 8 },
  { name: 'Gadget Fund', emoji: '💻', amount: 750, count: 2 },
];

const SavingsSourcesCard = ({ startDate, endDate, onTotalUpdate, onLoadingChange }) => {
  const { formatAmount } = useCurrency();

  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSources = async () => {
    try {
      setLoading(true);
      if (onLoadingChange) onLoadingChange(true);
      setError(null);

      // Simulate async fetch delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // NOTE: In a real app, you would pass `startDate` and `endDate` into your API 
      // call here to filter the real transactions. 
      const sourcesArray = DUMMY_SAVINGS
        .sort((a, b) => b.amount - a.amount)
        .map((s, i) => ({ ...s, id: i + 1 }));

      setSources(sourcesArray);
    } catch (err) {
      setError(err.message);
      console.error('Error loading savings sources:', err);
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  // Refetch when dates change
  useEffect(() => {
    fetchSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const calculateTotal = () => sources.reduce((sum, s) => sum + s.amount, 0);

  // Update the parent with the new total whenever sources array updates
  useEffect(() => {
    if (onTotalUpdate) {
      onTotalUpdate(calculateTotal());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources]);

  const downloadExcel = () => {
    if (sources.length === 0) return;

    const excelData = sources.map(s => ({
      'Source': s.name,
      'Amount': s.amount,
      'Transaction Count': s.count,
    }));
    excelData.push({
      'Source': 'TOTAL',
      'Amount': calculateTotal(),
      'Transaction Count': sources.reduce((s, i) => s + i.count, 0),
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    ws['!cols'] = [{ width: 25 }, { width: 15 }, { width: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Savings Sources');
    
    // Custom filename based on dates
    const fileName = startDate && endDate 
      ? `savings-sources-${startDate}-to-${endDate}.xlsx` 
      : 'savings-sources-all-time.xlsx';
      
    XLSX.writeFile(wb, fileName);
  };

  // Dynamic header text based on date props
  const periodText = startDate && endDate 
    ? `${new Date(startDate).toLocaleDateString()} – ${new Date(endDate).toLocaleDateString()}`
    : 'All time · savings transactions';

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 transition-shadow duration-300 min-h-[400px] max-h-[600px] sm:h-96 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Savings Sources</h2>
          <p className="text-xs text-gray-400">{periodText}</p>
        </div>

        <button
          onClick={downloadExcel}
          disabled={sources.length === 0}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
        >
          <Download size={16} />
          <span>Download</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading && sources.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        ) : error && sources.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500 text-center">
              <p>Error loading savings</p>
              <p className="text-xs mt-1">{error}</p>
              <button onClick={fetchSources} className="mt-2 text-sm text-purple-600 hover:text-purple-800">
                Retry
              </button>
            </div>
          </div>
        ) : sources.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-center">
              <PiggyBank className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="font-bold">No savings found</p>
              <p className="text-xs mt-1">Transactions with type "savings" will appear here</p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="px-6 py-2">
              <div className="grid grid-cols-1 gap-3">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150 border border-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{source.emoji}</div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{source.name}</p>
                        <p className="text-xs text-gray-500">
                          {source.count} transaction{source.count > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-purple-600">
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

      {/* Total */}
      {!loading && !error && sources.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🐷</div>
              <div>
                <p className="font-bold text-gray-800">Total Savings</p>
                <p className="text-xs text-gray-500">Period total</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-purple-600">
                +{formatAmount(calculateTotal())}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsSourcesCard;