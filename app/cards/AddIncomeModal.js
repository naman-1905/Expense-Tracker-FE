import React, { useState, useEffect } from 'react';
import { X, Calendar, Type, IndianRupee, Loader2, Clock, DollarSign } from 'lucide-react';
import { createTransaction } from '../api/utils/transactionAPI';

const EMOJIS = ['💰', '💵', '🪙', '📈', '🏦', '💳', '🎁', '💸'];

const CURRENCIES = [{ code: 'inr', symbol: '₹', name: 'Indian Rupee' }];

const AddIncomeModal = ({ isOpen, onClose, onAddIncome }) => {
  const [selectedEmoji, setSelectedEmoji] = useState('💰');
  const [incomeTitle, setIncomeTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('inr');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [exchangeRates, setExchangeRates] = useState({});
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [amountInINR, setAmountInINR] = useState(0);

  // Fetch exchange rates when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchExchangeRates();
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
      setDate(currentDate);
      setTime(currentTime);
    } else {
      // Reset form when modal closes
      setSelectedEmoji('💰');
      setIncomeTitle('');
      setAmount('');
      setSelectedCurrency('inr');
      setDate('');
      setTime('');
      setShowEmojiPicker(false);
      setError('');
      setIsLoading(false);
      setAmountInINR(0);
    }
  }, [isOpen]);

  // Calculate amount in INR whenever amount or currency changes
  useEffect(() => {
    if (amount && exchangeRates[selectedCurrency]) {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount)) {
        if (selectedCurrency === 'inr') {
          setAmountInINR(numAmount);
        } else {
          // Convert selected currency to INR
          const rateToINR = exchangeRates[selectedCurrency];
          setAmountInINR(numAmount * rateToINR);
        }
      } else {
        setAmountInINR(0);
      }
    } else {
      setAmountInINR(0);
    }
  }, [amount, selectedCurrency, exchangeRates]);

  const fetchExchangeRates = async () => {
    setExchangeRates({ inr: 1 });
    setSelectedCurrency('inr');
    setIsLoadingRates(false);
  };

  const formatDateTimeForDisplay = (date, time) => {
    if (!date || !time) return '';
    const dateObj = new Date(`${date}T${time}`);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return dateObj.toLocaleString('en-IN', options);
  };

  const getConversionRate = () => {
    if (selectedCurrency === 'inr') return null;
    const rate = exchangeRates[selectedCurrency];
    if (rate) {
      return `1 ${selectedCurrency.toUpperCase()} = ₹${rate.toFixed(2)}`;
    }
    return null;
  };

  const handleAddIncome = async () => {
    if (!incomeTitle || !amount || !date || !time) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (selectedCurrency !== 'inr' && !exchangeRates[selectedCurrency]) {
      setError('That currency rate is unavailable offline. Choose INR or connect to the internet.');
      return;
    }

    // FIX: Allow submission even if currency conversion isn't available
    const finalAmount = amountInINR > 0 ? amountInINR : parseFloat(amount);

    setIsLoading(true);
    setError('');

    try {
      const transactionData = {
        name: incomeTitle,
        amount: parseFloat(finalAmount.toFixed(2)), // Send INR amount
        type: 'income',
        emoji: selectedEmoji,
        date: new Date(`${date}T${time}`).toISOString()
      };

      console.log('Sending transaction data:', transactionData); // Debug log

      const result = await createTransaction(transactionData);
      
      if (onAddIncome) {
        onAddIncome(result);
      }

      onClose();
      
      const successMsg = `Income "${incomeTitle}" of ₹${finalAmount.toFixed(2)} added successfully!`;
      
      if (typeof window !== 'undefined') {
        if (window.toast) {
          window.toast.success(successMsg);
        } else {
          alert(successMsg);
        }
      }
      
    } catch (error) {
      console.error('Error adding income:', error);
      
      let errorMessage = 'Failed to add income. Please try again.';
      
      if (error.message.includes('Could not validate credentials')) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setShowEmojiPicker(false);
      onClose?.();
    }
  };

  if (!isOpen) return null;

  const selectedCurrencyData = CURRENCIES.find(c => c.code === selectedCurrency);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Add Income</h2>
          <button 
            onClick={handleClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Loading Rates Message */}
          {isLoadingRates && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center">
              <Loader2 size={16} className="animate-spin mr-2 text-blue-600" />
              <p className="text-blue-600 text-sm">Loading exchange rates...</p>
            </div>
          )}

          {/* Emoji Picker */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Choose Icon
            </label>
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-16 h-16 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-2xl border-2 border-gray-300 hover:border-green-500 transition-colors"
                disabled={isLoading}
              >
                {selectedEmoji}
              </button>

              {showEmojiPicker && (
                <div className="absolute mt-2 p-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg grid grid-cols-4 gap-2 z-10">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setSelectedEmoji(emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-2xl hover:bg-gray-200 rounded transition-colors p-1"
                      disabled={isLoading}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Income Source Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Type size={16} className="inline mr-1" />
              Income Source Title
            </label>
            <input
              type="text"
              value={incomeTitle}
              onChange={(e) => setIncomeTitle(e.target.value)}
              placeholder="e.g., Salary, Freelance, Investment"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              disabled={isLoading}
            />
          </div>

          {/* Currency Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <DollarSign size={16} className="inline mr-1" />
              Currency
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              disabled={isLoading || isLoadingRates}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {selectedCurrencyData?.symbol} Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              disabled={isLoading}
            />
          </div>

          {/* Conversion Rate & INR Amount */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 space-y-2">
              {getConversionRate() && (
                <p className="text-sm text-gray-600">
                  <strong>Rate:</strong> {getConversionRate()}
                </p>
              )}
              <p className="text-lg font-bold text-green-700">
                <IndianRupee size={18} className="inline mr-1" />
                Amount in INR: ₹{(amountInINR > 0 ? amountInINR : parseFloat(amount)).toFixed(2)}
              </p>
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Calendar size={16} className="inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              disabled={isLoading}
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Clock size={16} className="inline mr-1" />
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              disabled={isLoading}
            />
          </div>

          {/* Date & Time Preview */}
          {date && time && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 text-sm">
                <strong>Selected:</strong> {formatDateTimeForDisplay(date, time)}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleAddIncome}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                Adding...
              </>
            ) : (
              'Add Income'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddIncomeModal;
