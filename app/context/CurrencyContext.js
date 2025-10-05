"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
];

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [exchangeRates, setExchangeRates] = useState({ INR: 1 });
  const [loading, setLoading] = useState(true);

  // Load saved currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('expense_tracker_currency');
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json'
        );
        const data = await response.json();
        setExchangeRates({ INR: 1, ...data.inr });
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        // Fallback to INR only if fetch fails
        setExchangeRates({ INR: 1 });
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
    // Refresh rates every hour
    const interval = setInterval(fetchExchangeRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  const changeCurrency = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    localStorage.setItem('expense_tracker_currency', currencyCode);
  };

  const convertFromINR = (amountInINR) => {
    if (selectedCurrency === 'INR') return amountInINR;
    const rate = exchangeRates[selectedCurrency.toLowerCase()];
    return rate ? amountInINR * rate : amountInINR;
  };

  const formatAmount = (amountInINR, options = {}) => {
    const convertedAmount = convertFromINR(amountInINR);
    const currencyInfo = CURRENCIES.find(c => c.code === selectedCurrency);
    
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: options.minimumFractionDigits ?? 0,
      maximumFractionDigits: options.maximumFractionDigits ?? 2,
    }).format(Math.abs(convertedAmount));

    return `${currencyInfo?.symbol || selectedCurrency} ${formatted}`;
  };

  const getCurrencySymbol = () => {
    const currencyInfo = CURRENCIES.find(c => c.code === selectedCurrency);
    return currencyInfo?.symbol || selectedCurrency;
  };

  const value = {
    selectedCurrency,
    changeCurrency,
    convertFromINR,
    formatAmount,
    getCurrencySymbol,
    exchangeRates,
    loading,
    currencies: CURRENCIES,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};