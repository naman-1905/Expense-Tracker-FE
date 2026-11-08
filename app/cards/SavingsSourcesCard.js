import React, { useState, useEffect, useCallback } from 'react';
import { PiggyBank, Download, Plus, X } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import * as XLSX from 'xlsx';
import { getTransactionsLocal, subscribeToLocalChanges } from '../api/utils/localStore';
import { createTransaction } from '../api/utils/transactionAPI';

const SavingsSourcesCard = ({ startDate, endDate, onTotalUpdate, onLoadingChange }) => {
  const { formatAmount } = useCurrency();

  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const addSavings = async (event) => {
    event.preventDefault();
    try {
      await createTransaction({ name: newName, amount: Number(newAmount), type: 'savings', emoji: '🐷' });
      setNewName('');
      setNewAmount('');
      setShowAdd(false);
    } catch (addError) {
      setError(addError.message);
    }
  };

  const fetchSources = useCallback(async () => {
    try {
      setLoading(true);
      if (onLoadingChange) onLoadingChange(true);
      setError(null);

      const sources = getTransactionsLocal().filter((transaction) => {
        if (transaction.type !== 'savings') return false;
        const date = new Date(transaction.date).getTime();
        return (!startDate || date >= new Date(startDate).getTime())
          && (!endDate || date <= new Date(`${endDate}T23:59:59.999`).getTime());
      });
      const grouped = sources.reduce((result, transaction) => {
        const key = transaction.name;
        result[key] ||= { name: key, emoji: transaction.emoji || '🐷', amount: 0, count: 0 };
        result[key].amount += Number(transaction.amount);
        result[key].count += 1;
        return result;
      }, {});
      const sourcesArray = Object.values(grouped).sort((a, b) => b.amount - a.amount).map((source, index) => ({ ...source, id: index + 1 }));

      setSources(sourcesArray);
    } catch (err) {
      setError(err.message);
      console.error('Error loading savings sources:', err);
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  }, [startDate, endDate, onLoadingChange]);

  // Refetch when dates change
  useEffect(() => {
    fetchSources();
    return subscribeToLocalChanges(fetchSources);
  }, [startDate, endDate, fetchSources]);

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

        <div className="flex w-full sm:w-auto gap-2">
          <button onClick={() => setShowAdd((value) => !value)} className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700">
            {showAdd ? <X size={16} /> : <Plus size={16} />}<span>{showAdd ? 'Close' : 'Add savings'}</span>
          </button>
          <button onClick={downloadExcel} disabled={sources.length === 0} className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
            <Download size={16} /><span>Export</span>
          </button>
        </div>
      </div>

      {showAdd && <form onSubmit={addSavings} className="grid grid-cols-1 gap-2 border-b border-gray-100 bg-purple-50/60 p-4 sm:grid-cols-[1fr_150px_auto]">
        <input aria-label="Savings goal" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Savings goal · e.g. Emergency fund" required maxLength={255} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" />
        <input aria-label="Amount in rupees" type="number" min="0.01" step="0.01" value={newAmount} onChange={(event) => setNewAmount(event.target.value)} placeholder="Amount in ₹" required className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" />
        <button type="submit" className="rounded-lg bg-[#7957f3] px-4 py-2 text-sm font-semibold text-white">Save locally</button>
      </form>}

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
              <p className="text-xs mt-1">Add savings transactions to see your progress here</p>
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
