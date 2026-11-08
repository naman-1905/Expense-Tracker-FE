import { dbBatch, dbQuery, dbRun, dispatchFinanceChange } from '../../lib/financeDatabase';

const id = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const CHANGE_EVENT = 'expense-tracker:changed';

export async function initializeLocalStore() {
  await dbQuery('SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1');
}

export async function getTransactionsLocal() {
  const rows = await dbQuery(`
    SELECT id AS transaction_id, description AS name, amount, type, emoji, occurred_at AS date, category_id, account_id, note, currency, NULL AS plan_id, 'contribution' AS direction
    FROM transactions WHERE is_deleted = 0
    UNION ALL
    SELECT id AS transaction_id, COALESCE(note, 'Savings') AS name, amount, 'savings' AS type, '🐷' AS emoji, occurred_at AS date, NULL AS category_id, NULL AS account_id, note, currency, plan_id, direction
    FROM contributions
    ORDER BY date DESC
  `);
  return rows;
}

export async function saveTransactionsLocal(transactions) {
  const operations = [{ sql: 'DELETE FROM transactions' }, { sql: 'DELETE FROM contributions' }];
  for (const row of transactions) {
    const type = row.type === 'savings' ? 'savings' : row.type;
    if (type === 'savings') {
      operations.push({ sql: 'INSERT INTO contributions (id, plan_id, amount, currency, direction, occurred_at, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', values: [String(row.transaction_id || id()), row.plan_id || null, Number(row.amount), row.currency || 'INR', row.direction || 'contribution', row.date || new Date().toISOString(), row.name || null, new Date().toISOString()] });
    } else {
      operations.push({ sql: 'INSERT INTO transactions (id, account_id, category_id, type, amount, currency, occurred_at, description, emoji, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', values: [String(row.transaction_id || id()), row.account_id || 'cash', row.category_id || null, type, Number(row.amount), row.currency || 'INR', row.date || new Date().toISOString(), row.name, row.emoji || null, row.note || null, new Date().toISOString()] });
    }
  }
  await dbBatch(operations);
}

export async function getProfileLocal() {
  const rows = await dbQuery('SELECT id, display_name AS name, base_currency FROM profiles ORDER BY created_at LIMIT 1');
  return rows[0] || { id: 'local', name: 'My account', email: 'Saved on this device', base_currency: 'INR' };
}

export async function saveProfileLocal(profile) {
  const normalized = { id: String(profile.id || 'local'), name: profile.name?.trim() || 'My account', email: 'Saved on this device', base_currency: profile.base_currency || 'INR' };
  await dbRun('INSERT INTO profiles (id, display_name, base_currency, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET display_name = excluded.display_name, base_currency = excluded.base_currency', [normalized.id, normalized.name, normalized.base_currency, new Date().toISOString()]);
  return normalized;
}

export const subscribeToLocalChanges = (callback) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
};

export async function getLocalSummary() {
  const rows = await dbQuery(`SELECT type, SUM(amount) AS total FROM transactions WHERE is_deleted = 0 GROUP BY type`);
  const totals = Object.fromEntries(rows.map((row) => [row.type, Number(row.total || 0)]));
  const contributions = await dbQuery("SELECT COALESCE(SUM(CASE WHEN direction='contribution' THEN amount ELSE -amount END),0) AS total FROM contributions");
  const totalIncome = totals.income || 0;
  const totalExpenses = totals.expense || 0;
  const totalSavings = Number(contributions[0]?.total || 0);
  return { totalIncome, totalExpenses, totalSavings, totalBalance: totalIncome - totalExpenses };
}

export async function exportLocalBackup() {
  const transactions = await getTransactionsLocal();
  const profile = await getProfileLocal();
  const plans = await dbQuery('SELECT * FROM savings_plans');
  const contributions = await dbQuery('SELECT * FROM contributions');
  const accounts = await dbQuery('SELECT * FROM accounts');
  const categories = await dbQuery('SELECT * FROM categories');
  const budgets = await dbQuery('SELECT * FROM budgets');
  return { format: 'expense-tracker-backup', version: 2, exportedAt: new Date().toISOString(), profile, transactions, plans, contributions, accounts, categories, budgets };
}

export async function importLocalBackup(backup, mode = 'replace') {
  if (!['replace', 'merge'].includes(mode)) throw new Error('Choose whether to merge or replace local data.');
  if (backup?.format !== 'expense-tracker-backup' || !Array.isArray(backup.transactions)) throw new Error('This file is not an Expense Tracker backup.');
  const valid = backup.transactions.every((row) => row && typeof row.name === 'string' && Number.isFinite(Number(row.amount)) && ['income', 'expense', 'savings'].includes(row.type));
  if (!valid) throw new Error('The backup contains an invalid transaction. Existing data was not changed.');
  for (const key of ['plans', 'contributions', 'accounts', 'categories', 'budgets']) {
    if (backup[key] !== undefined && !Array.isArray(backup[key])) throw new Error(`The backup has an invalid ${key} section. Existing data was not changed.`);
  }
  if ((backup.plans || []).some((plan) => !plan || typeof plan.name !== 'string' || !Number.isFinite(Number(plan.target_amount)) || Number(plan.target_amount) <= 0)) throw new Error('The backup contains an invalid savings plan. Existing data was not changed.');
  if ((backup.accounts || []).some((account) => !account || typeof account.name !== 'string' || !account.id)) throw new Error('The backup contains an invalid account. Existing data was not changed.');
  if ((backup.categories || []).some((category) => !category || typeof category.name !== 'string' || !category.id || !['income', 'expense'].includes(category.kind))) throw new Error('The backup contains an invalid category. Existing data was not changed.');
  if ((backup.budgets || []).some((budget) => !budget || !budget.category_id || !budget.month || !Number.isFinite(Number(budget.limit_amount)) || Number(budget.limit_amount) <= 0)) throw new Error('The backup contains an invalid budget. Existing data was not changed.');
  let rows = backup.transactions;
  if (mode === 'merge') {
    const existing = await getTransactionsLocal();
    const seen = new Set(existing.map((row) => String(row.transaction_id)));
    rows = [...existing, ...backup.transactions.filter((row) => !seen.has(String(row.transaction_id)))];
  }
  const operations = [];
  if (mode === 'replace') operations.push(...[
    { sql: 'DELETE FROM transactions' }, { sql: 'DELETE FROM contributions' }, { sql: 'DELETE FROM savings_plans' }, { sql: 'DELETE FROM budgets' }, { sql: 'DELETE FROM accounts' }, { sql: 'DELETE FROM categories' },
  ]);
  for (const row of rows) {
    if (row.type === 'savings') operations.push({
      sql: 'INSERT OR IGNORE INTO contributions (id,plan_id,amount,currency,direction,occurred_at,note,created_at) VALUES (?,?,?,?,?,?,?,?)',
      values: [String(row.transaction_id || id()), row.plan_id || null, Number(row.amount), row.currency || 'INR', row.direction || 'contribution', row.date || new Date().toISOString(), row.note || row.name || null, new Date().toISOString()],
    });
    else operations.push({
      sql: 'INSERT OR IGNORE INTO transactions (id,account_id,category_id,type,amount,currency,occurred_at,description,emoji,note,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      values: [String(row.transaction_id || id()), row.account_id || 'cash', row.category_id || null, row.type, Number(row.amount), row.currency || 'INR', row.date || new Date().toISOString(), row.name, row.emoji || null, row.note || null, new Date().toISOString()],
    });
  }
  for (const plan of backup.plans || []) operations.push({
    sql: 'INSERT OR IGNORE INTO savings_plans (id,name,description,target_amount,target_currency,start_date,target_date,starting_amount,priority,color,icon,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    values: [plan.id || id(), plan.name, plan.description || null, plan.target_amount, plan.target_currency || 'INR', plan.start_date || null, plan.target_date || null, plan.starting_amount || 0, plan.priority || 2, plan.color || null, plan.icon || null, plan.status || 'active', plan.created_at || new Date().toISOString(), plan.updated_at || new Date().toISOString()],
  });
  for (const budget of backup.budgets || []) operations.push({
    sql: 'INSERT OR IGNORE INTO budgets (id,category_id,month,limit_amount,currency) VALUES (?,?,?,?,?)',
    values: [budget.id || id(), budget.category_id, budget.month, budget.limit_amount, budget.currency || 'INR'],
  });
  for (const account of backup.accounts || []) operations.push({
    sql: 'INSERT OR IGNORE INTO accounts (id,name,type,currency,is_archived,created_at) VALUES (?,?,?,?,?,?)',
    values: [account.id, account.name, account.type || 'cash', account.currency || 'INR', account.is_archived ? 1 : 0, account.created_at || new Date().toISOString()],
  });
  for (const category of backup.categories || []) operations.push({
    sql: 'INSERT OR IGNORE INTO categories (id,name,kind,is_user_created,icon) VALUES (?,?,?,?,?)',
    values: [category.id, category.name, category.kind, category.is_user_created ? 1 : 0, category.icon || null],
  });
  operations.push({ sql: 'INSERT OR IGNORE INTO accounts (id,name,type,currency,created_at) VALUES (?,?,?,?,?)', values: ['cash', 'Cash', 'cash', 'INR', new Date().toISOString()] });
  if (backup.profile) {
    const profile = backup.profile;
    operations.push({
      sql: 'INSERT INTO profiles (id,display_name,base_currency,created_at) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET display_name=excluded.display_name, base_currency=excluded.base_currency',
      values: [String(profile.id || 'local'), profile.name?.trim() || 'My account', profile.base_currency || 'INR', new Date().toISOString()],
    });
  }
  await dbBatch(operations);
  dispatchFinanceChange();
  return backup.transactions.length;
}

export async function getMigrationStatus() {
  const rows = await dbQuery("SELECT value FROM app_meta WHERE key = 'legacy_localstorage_v1'");
  return rows[0] ? JSON.parse(rows[0].value) : null;
}

export async function confirmLegacyMigration() {
  const status = await getMigrationStatus();
  if (!status) return;
  await dbRun('UPDATE app_meta SET value = ? WHERE key = ?', [JSON.stringify({ ...status, confirmed: true, confirmedAt: new Date().toISOString() }), 'legacy_localstorage_v1']);
  for (const key of ['expense_tracker_transactions_v1', 'expense_tracker_local_profile_v1', 'expense_tracker_user_data']) window.localStorage.removeItem(key);
}

export async function downloadLocalBackup() {
  const blob = new Blob([JSON.stringify(await exportLocalBackup(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `pocket-finance-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
