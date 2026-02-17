import React, { useState, useEffect } from 'react';
import { PiggyBank, Download } from 'lucide-react';
import { getAllSavingsTransactions } from '../api/utils/historyAPI';
import { useCurrency } from '../context/CurrencyContext';
import * as XLSX from 'xlsx';

// Standalone card — fetches ALL transactions of type 'savings', no date filter.
const SavingsSourcesCard = () => {
  const { formatAmount } = useCurrency();

  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSources = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load cache immediately for instant render
      const cached = localStorage.getItem('savingsSourcesData');
      if (cached) {
        setSources(JSON.parse(cached));
        setLoading(false);
      }

      // Fetch all savings-type transactions
      const data = await getAllSavingsTransactions(1000);
      const savingsTransactions = data.transactions || [];

      // Group by name, sum amounts
      const grouped = savingsTransactions.reduce((acc, t) => {
        const key = t.name;
        if (!acc[key]) {
          acc[key] = { name: t.name, emoji: t.emoji || '🐷', amount: 0, count: 0 };
        }
        acc[key].amount += t.amount;
        acc[key].count += 1;
        return acc;
      }, {});

      const sourcesArray = Object.values(grouped)
        .sort((a, b) => b.amount - a.amount)
        .map((s, i) => ({ ...s, id: i + 1 }));

      setSources(sourcesArray);
      localStorage.setItem('savingsSourcesData', JSON.stringify(sourcesArray));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching savings sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const calculateTotal = () => sources.reduce((sum, s) => sum + s.amount, 0);

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
    XLSX.writeFile(wb, `savings-sources-all-time.xlsx`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 transition-shadow duration-300 min-h-[400px] max-h-[600px] sm:h-96 flex flex-col">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Savings Sources</h2>
          <p className="text-xs text-gray-400">All time · savings transactions</p>
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
                <p className="text-xs text-gray-500">All time</p>
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