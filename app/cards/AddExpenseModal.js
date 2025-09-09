import React, { useState, useEffect } from 'react';
import { X, Calendar, Type, IndianRupee } from 'lucide-react';

const EMOJIS = ['💰', '🍔', '🚗', '🎁', '🛒', '💳', '🏠', '🎉', '📦', '⚡'];

const AddExpenseModal = ({ isOpen, onClose, onAddExpense }) => {
  const [selectedEmoji, setSelectedEmoji] = useState('💰');
  const [ExpenseTitle, setExpenseTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedEmoji('💰');
      setExpenseTitle('');
      setAmount('');
      setDate('');
      setShowEmojiPicker(false);
    }
  }, [isOpen]);

  const formatDateForDisplay = (inputDate) => {
    if (!inputDate) return '';
    const d = new Date(inputDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (e) => setDate(formatDateForDisplay(e.target.value));

  const handleAddExpense = () => {
    if (!ExpenseTitle || !amount || !date) {
      alert('Please fill in all fields');
      return;
    }
    onAddExpense?.({
      emoji: selectedEmoji,
      title: ExpenseTitle,
      amount: parseFloat(amount),
      date
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Add Expense</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Emoji Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Choose Icon
            </label>
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-16 h-16 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-2xl border-2 border-gray-300 hover:border-red-500 cursor-pointer"
              >
                {selectedEmoji}
              </button>
              {showEmojiPicker && (
                <div className="absolute mt-2 bg-white border rounded-lg shadow-lg p-2 grid grid-cols-5 gap-2 z-50">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setSelectedEmoji(emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-2xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expense Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Type size={16} className="inline mr-1" />
              Expense Title
            </label>
            <input
              type="text"
              value={ExpenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder="e.g., Food, Travel, Bills"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
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
              onChange={handleDateChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
            {date && <p className="text-sm text-gray-600">Selected: {date}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAddExpense}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Expense
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
