import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Type, IndianRupee } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const AddIncomeModal = ({ isOpen, onClose, onAddIncome }) => {
  const [selectedEmoji, setSelectedEmoji] = useState('💰');
  const [incomeTitle, setIncomeTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedEmoji('💰');
      setIncomeTitle('');
      setAmount('');
      setDate('');
      setShowEmojiPicker(false);
    }
  }, [isOpen]);

  const formatDateForDisplay = (inputDate) => {
    if (!inputDate) return '';
    const date = new Date(inputDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    setDate(formatDateForDisplay(inputDate));
  };

  const handleAddIncome = () => {
    if (!incomeTitle || !amount || !date) {
      alert('Please fill in all fields');
      return;
    }
    
    const incomeData = {
      emoji: selectedEmoji,
      title: incomeTitle,
      amount: parseFloat(amount),
      date: date
    };
    
    if (onAddIncome) {
      onAddIncome(incomeData);
    }
  };

  const handleClose = () => {
    setShowEmojiPicker(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Add Income</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Emoji Picker */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Choose Icon
            </label>
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-16 h-16 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-2xl transition-colors border-2 border-gray-300 hover:border-green-500"
              >
                {selectedEmoji}
              </button>
              
              {showEmojiPicker && (
                <Picker
                    data={data}
                    onEmojiSelect={(emoji) => {
                    setSelectedEmoji(emoji.native);
                    setShowEmojiPicker(false);
                    }}
                    theme="light"
                />
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            />
            {date && (
              <p className="text-sm text-gray-600">Selected: {date}</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 cursor-pointer hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddIncome}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg font-medium transition-colors"
          >
            Add Income
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddIncomeModal;
