import { getLocalSummary, getTransactionsLocal } from './localStore';

export const getTotalBalance = async () => ({ balance: (await getLocalSummary()).totalBalance });
export const getTotalIncome = async () => ({ total_income: (await getLocalSummary()).totalIncome });
export const getTotalExpenses = async () => ({ total_expenses: (await getLocalSummary()).totalExpenses });
export const getSummaryData = async () => getLocalSummary();

const filterTransactions = async (start, end, limit) => {
  const after = start ? new Date(start).getTime() : null;
  const before = end ? new Date(`${end.slice(0, 10)}T23:59:59.999`).getTime() : null;
  return (await getTransactionsLocal()).filter((row) => {
    const time = new Date(row.date).getTime();
    return (!after || time >= after) && (!before || time <= before);
  }).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
};

export const getRecentTransactions = async (days = 30, limit = 100) => {
  const start = new Date();
  start.setDate(start.getDate() - Number(days));
  return { transactions: await filterTransactions(start.toISOString(), null, limit) };
};

export const getTransactionsDateRange = async (startDate, endDate, limit = 100) => ({ transactions: await filterTransactions(startDate, endDate, limit) });
export const checkHistoryServiceHealth = async () => ({ status: 'healthy', service: 'on-device SQLite' });
