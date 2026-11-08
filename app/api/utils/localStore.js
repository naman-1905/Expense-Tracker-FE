const TRANSACTIONS_KEY = 'expense_tracker_transactions_v1';
const PROFILE_KEY = 'expense_tracker_local_profile_v1';
const CHANGE_EVENT = 'expense-tracker:changed';

const read = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  if (typeof window === 'undefined') throw new Error('Local storage is only available in the app');
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch (error) {
    if (error?.name === 'QuotaExceededError') throw new Error('Device storage is full. Export a backup and remove older records.');
    throw error;
  }
};

export const getTransactionsLocal = () => read(TRANSACTIONS_KEY, []);

export const saveTransactionsLocal = (transactions) => write(TRANSACTIONS_KEY, transactions);

export const getProfileLocal = () => read(PROFILE_KEY, { id: 'local', name: 'My account', email: 'Saved on this device' });

export const saveProfileLocal = (profile) => {
  const normalized = { id: 'local', name: profile.name?.trim() || 'My account', email: profile.email?.trim() || 'Saved on this device' };
  write(PROFILE_KEY, normalized);
  return normalized;
};

export const subscribeToLocalChanges = (callback) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
};

export const getLocalSummary = () => {
  const rows = getTransactionsLocal();
  const totalIncome = rows.filter((row) => row.type === 'income').reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const totalExpenses = rows.filter((row) => row.type === 'expense').reduce((sum, row) => sum + Number(row.amount || 0), 0);
  return { totalIncome, totalExpenses, totalBalance: totalIncome - totalExpenses };
};

export const exportLocalBackup = () => ({
  format: 'expense-tracker-backup',
  version: 1,
  exportedAt: new Date().toISOString(),
  profile: getProfileLocal(),
  transactions: getTransactionsLocal(),
});

export const importLocalBackup = (backup) => {
  if (backup?.format !== 'expense-tracker-backup' || !Array.isArray(backup.transactions)) {
    throw new Error('This file is not an Expense Tracker backup.');
  }
  const valid = backup.transactions.every((row) => row && typeof row.name === 'string' && Number.isFinite(Number(row.amount)) && ['income', 'expense', 'savings'].includes(row.type));
  if (!valid) throw new Error('The backup contains an invalid transaction.');
  saveTransactionsLocal(backup.transactions);
  if (backup.profile) saveProfileLocal(backup.profile);
  return backup.transactions.length;
};

export const downloadLocalBackup = () => {
  const blob = new Blob([JSON.stringify(exportLocalBackup(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `expense-tracker-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};
