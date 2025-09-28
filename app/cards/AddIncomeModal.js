import React, { useState, useEffect } from 'react';
import { X, Calendar, Type, IndianRupee, Loader2, Clock } from 'lucide-react';
import { createTransaction } from '../api/utils/transactionAPI';

const EMOJIS = ['💰', '💵', '🪙', '📈', '🏦', '💳', '🎁', '💸'];

const AddIncomeModal = ({ isOpen, onClose, onAddIncome }) => {
  const [selectedEmoji, setSelectedEmoji] = useState('💰');
  const [incomeTitle, setIncomeTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Set current date and time as default
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
      
      setDate(currentDate);
      setTime(currentTime);
    } else {
      // Reset form when modal closes
      setSelectedEmoji('💰');
      setIncomeTitle('');
      setAmount('');
      setDate('');
      setTime('');
      setShowEmojiPicker(false);
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

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

  const handleAddIncome = async () => {
    if (!incomeTitle || !amount || !date || !time) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create transaction data
      const transactionData = {
        title: incomeTitle, // This will be mapped to 'name' in the API
        amount: parseFloat(amount),
        type: 'income',
        emoji: selectedEmoji
        // Note: Backend auto-generates timestamp, but you can extend API to accept custom dates
      };

      // Make API call using the transaction API
      const result = await createTransaction(transactionData);
      
      // Call the parent callback if provided
      if (onAddIncome) {
        onAddIncome(result);
      }

      // Close modal and reset form
      onClose();
      
      // Show success message
      const successMsg = `Income "${incomeTitle}" of ₹${amount} added successfully!`;
      
      // You can replace this with a toast notification or custom success handler
      if (typeof window !== 'undefined') {
        // Check if you have a toast library, otherwise use alert
        if (window.toast) {
          window.toast.success(successMsg);
        } else {
          alert(successMsg);
        }
      }
      
    } catch (error) {
      console.error('Error adding income:', error);
      
      // Handle specific error types
      let errorMessage = 'Failed to add income. Please try again.';
      
      if (error.message.includes('Could not validate credentials')) {
        errorMessage = 'Your session has expired. Please log in again.';
        // You might want to redirect to login or refresh token here
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

          {/* Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <IndianRupee size={16} className="inline mr-1" />
              Amount
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