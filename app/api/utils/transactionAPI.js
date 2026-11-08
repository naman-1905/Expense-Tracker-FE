import { dbQuery, dbRun, dispatchFinanceChange } from '../../lib/financeDatabase';

const uuid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const fromRow = (row) => ({ ...row, transaction_id: row.id, name: row.description, title: row.description, date: row.occurred_at, emoji: row.emoji || '💸' });

export async function createTransaction(data) {
  const name = String(data.name || data.title || '').trim();
  const amount = Number(data.amount);
  const type = data.type;
  if (!name || !Number.isFinite(amount) || amount <= 0 || !['income', 'expense', 'savings', 'transfer'].includes(type)) throw new Error('Enter a description and a positive amount.');
  const occurredAt = data.date || new Date().toISOString();
  if (type === 'savings') {
    await dbRun('INSERT INTO contributions (id, plan_id, amount, currency, direction, occurred_at, note, linked_transaction_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [uuid(), data.plan_id || null, amount, data.currency || 'INR', data.direction || 'contribution', occurredAt, data.note || name, null, new Date().toISOString()]);
    dispatchFinanceChange();
    return { name, amount, type, date: occurredAt, emoji: '🐷', plan_id: data.plan_id || null };
  }
  const id = uuid();
  await dbRun('INSERT INTO transactions (id, account_id, category_id, type, amount, currency, occurred_at, description, emoji, note, transfer_account_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, data.account_id || 'cash', data.category_id || null, type, amount, data.currency || 'INR', occurredAt, name, data.emoji || '💸', data.note || null, data.transfer_account_id || null, new Date().toISOString()]);
  dispatchFinanceChange();
  return { transaction_id: id, name, amount, type, date: occurredAt, emoji: data.emoji || '💸' };
}

export async function getTransactions({ skip = 0, limit = 100, transaction_type } = {}) {
  const rows = await dbQuery('SELECT * FROM transactions WHERE is_deleted = 0 ORDER BY occurred_at DESC LIMIT ? OFFSET ?', [limit, skip]);
  const contributions = await dbQuery("SELECT id, plan_id, amount, currency, direction, occurred_at, note FROM contributions ORDER BY occurred_at DESC LIMIT ?", [limit]);
  const combined = [...rows.map(fromRow), ...contributions.map((row) => ({ ...row, transaction_id: row.id, name: row.note || 'Savings', type: 'savings', date: row.occurred_at, emoji: '🐷' }))].sort((a, b) => new Date(b.date) - new Date(a.date));
  return transaction_type ? combined.filter((row) => row.type === transaction_type).slice(skip, skip + limit) : combined.slice(0, limit);
}

export async function getTransaction(id) {
  const rows = await dbQuery('SELECT * FROM transactions WHERE id = ? AND is_deleted = 0', [String(id)]);
  if (rows[0]) return fromRow(rows[0]);
  const savings = await dbQuery('SELECT * FROM contributions WHERE id = ?', [String(id)]);
  return savings[0] ? { ...savings[0], transaction_id: savings[0].id, name: savings[0].note || 'Savings', type: 'savings', date: savings[0].occurred_at } : null;
}

export async function updateTransaction(id, data) {
  const current = await getTransaction(id);
  if (!current) throw new Error('Transaction not found.');
  if (data.amount !== undefined && (!Number.isFinite(Number(data.amount)) || Number(data.amount) <= 0)) throw new Error('Enter an amount greater than zero.');
  if ((data.name !== undefined || data.title !== undefined) && !String(data.name || data.title || '').trim()) throw new Error('Add a description.');
  if (current.type === 'savings') {
    await dbRun('UPDATE contributions SET note = COALESCE(?, note), amount = COALESCE(?, amount), occurred_at = COALESCE(?, occurred_at) WHERE id = ?', [data.name || data.title || null, data.amount === undefined ? null : Number(data.amount), data.date || null, String(id)]);
  } else {
    await dbRun('UPDATE transactions SET description = COALESCE(?, description), amount = COALESCE(?, amount), type = COALESCE(?, type), emoji = COALESCE(?, emoji), note = COALESCE(?, note), occurred_at = COALESCE(?, occurred_at) WHERE id = ?', [data.name || data.title || null, data.amount === undefined ? null : Number(data.amount), data.type || null, data.emoji || null, data.note || null, data.date || null, String(id)]);
  }
  dispatchFinanceChange();
  return getTransaction(id);
}

export async function deleteTransaction(id) {
  const current = await getTransaction(id);
  if (current?.type === 'savings') await dbRun('DELETE FROM contributions WHERE id = ?', [String(id)]);
  else await dbRun('UPDATE transactions SET is_deleted = 1 WHERE id = ?', [String(id)]);
  dispatchFinanceChange();
  return current;
}

export async function restoreTransaction(record) {
  if (!record?.transaction_id) throw new Error('This record can no longer be restored.');
  if (record.type === 'savings') {
    await dbRun('INSERT INTO contributions (id,plan_id,amount,currency,direction,occurred_at,note,created_at) VALUES (?,?,?,?,?,?,?,?)', [String(record.transaction_id), record.plan_id || null, Number(record.amount), record.currency || 'INR', record.direction || 'contribution', record.date || new Date().toISOString(), record.note || record.name || null, new Date().toISOString()]);
  } else {
    await dbRun('UPDATE transactions SET is_deleted = 0 WHERE id = ?', [String(record.transaction_id)]);
  }
  dispatchFinanceChange();
}

export async function getMonthlyTransactionSummary(year, month) {
  const start = new Date(Number(year), Number(month) - 1, 1).toISOString();
  const end = new Date(Number(year), Number(month), 1).toISOString();
  const rows = await dbQuery('SELECT type, SUM(amount) AS amount, COUNT(*) AS count FROM transactions WHERE is_deleted = 0 AND occurred_at >= ? AND occurred_at < ? GROUP BY type', [start, end]);
  const stats = Object.fromEntries(rows.map((row) => [row.type, row]));
  return { year, month, total_income: Number(stats.income?.amount || 0), total_expenses: Number(stats.expense?.amount || 0), net_amount: Number(stats.income?.amount || 0) - Number(stats.expense?.amount || 0), transaction_count: rows.reduce((sum, row) => sum + Number(row.count), 0) };
}
