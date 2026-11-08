import { getTransactionsLocal, saveTransactionsLocal } from './localStore';

export const createTransaction = async (data) => {
  const rows = getTransactionsLocal();
  const transaction = {
    transaction_id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: (data.name || data.title || '').trim(),
    amount: Number(data.amount),
    type: data.type,
    emoji: data.emoji || '💸',
    date: data.date || new Date().toISOString(),
  };
  if (!transaction.name || !Number.isFinite(transaction.amount) || transaction.amount <= 0 || !['income', 'expense', 'savings'].includes(transaction.type)) {
    throw new Error('Enter a name and a positive amount.');
  }
  rows.unshift(transaction);
  saveTransactionsLocal(rows);
  return transaction;
};

export const getTransactions = async ({ skip = 0, limit = 100, transaction_type } = {}) => {
  let rows = getTransactionsLocal();
  if (transaction_type) rows = rows.filter((row) => row.type === transaction_type);
  return rows.slice(skip, skip + limit);
};

export const getTransaction = async (id) => getTransactionsLocal().find((row) => row.transaction_id === id) || null;

export const updateTransaction = async (id, data) => {
  const rows = getTransactionsLocal();
  const index = rows.findIndex((row) => row.transaction_id === id);
  if (index < 0) throw new Error('Transaction not found.');
  rows[index] = { ...rows[index], ...(data.title ? { name: data.title } : {}), ...(data.name ? { name: data.name } : {}), ...('amount' in data ? { amount: Number(data.amount) } : {}), ...(data.type ? { type: data.type } : {}), ...('emoji' in data ? { emoji: data.emoji } : {}) };
  saveTransactionsLocal(rows);
  return rows[index];
};

export const deleteTransaction = async (id) => {
  saveTransactionsLocal(getTransactionsLocal().filter((row) => row.transaction_id !== id));
  return true;
};

export const getMonthlyTransactionSummary = async (year, month) => {
  const rows = getTransactionsLocal().filter((row) => {
    const date = new Date(row.date);
    return date.getFullYear() === Number(year) && date.getMonth() + 1 === Number(month);
  });
  const total_income = rows.filter((row) => row.type === 'income').reduce((sum, row) => sum + Number(row.amount), 0);
  const total_expenses = rows.filter((row) => row.type === 'expense').reduce((sum, row) => sum + Number(row.amount), 0);
  return { year, month, total_income, total_expenses, net_amount: total_income - total_expenses, transaction_count: rows.length };
};
