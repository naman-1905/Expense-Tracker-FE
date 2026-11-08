"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfileLocal, saveProfileLocal } from '../api/utils/localStore';

const CurrencyContext = createContext();

export const CURRENCIES = [{ code: 'INR', name: 'Indian Rupee', symbol: '₹' }];

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [exchangeRates] = useState({ inr: 1 });
  const [loading] = useState(false);

  useEffect(() => {
    getProfileLocal().then((profile) => setSelectedCurrency(profile.base_currency || 'INR'));
  }, []);

  const changeCurrency = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    getProfileLocal().then((profile) => saveProfileLocal({ ...profile, base_currency: currencyCode }));
  };

  const convertFromINR = (amountInINR) => {
    if (selectedCurrency === 'INR') return amountInINR;
    const rate = exchangeRates[selectedCurrency.toLowerCase()];
    return rate ? amountInINR * rate : amountInINR;
  };

  const effectiveCurrency = selectedCurrency === 'INR' || exchangeRates[selectedCurrency.toLowerCase()]
    ? selectedCurrency
    : 'INR';

  const formatAmount = (amountInINR, options = {}) => {
    const convertedAmount = convertFromINR(amountInINR);
    const currencyInfo = CURRENCIES.find(c => c.code === effectiveCurrency);
    
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: options.minimumFractionDigits ?? 0,
      maximumFractionDigits: options.maximumFractionDigits ?? 2,
    }).format(Math.abs(convertedAmount));

    return `${currencyInfo?.symbol || effectiveCurrency} ${formatted}`;
  };

  const getCurrencySymbol = () => {
    const currencyInfo = CURRENCIES.find(c => c.code === effectiveCurrency);
    return currencyInfo?.symbol || effectiveCurrency;
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
