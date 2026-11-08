const DATABASE_NAME = 'pocket_finance';
const DATABASE_VERSION = 1;
const CHANGE_EVENT = 'expense-tracker:changed';

let connectionPromise;

const schema = `
CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY, display_name TEXT NOT NULL, base_currency TEXT NOT NULL DEFAULT 'INR', created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, currency TEXT NOT NULL, is_archived INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('income','expense')), is_user_created INTEGER NOT NULL DEFAULT 0, icon TEXT);
CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, account_id TEXT, category_id TEXT, type TEXT NOT NULL CHECK(type IN ('income','expense','transfer')), amount REAL NOT NULL CHECK(amount > 0), currency TEXT NOT NULL, occurred_at TEXT NOT NULL, description TEXT NOT NULL, emoji TEXT, note TEXT, transfer_account_id TEXT, is_deleted INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS savings_plans (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, target_amount REAL NOT NULL CHECK(target_amount > 0), target_currency TEXT NOT NULL, start_date TEXT, target_date TEXT, starting_amount REAL NOT NULL DEFAULT 0, priority INTEGER NOT NULL DEFAULT 2, color TEXT, icon TEXT, status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','completed','archived')), created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS contributions (id TEXT PRIMARY KEY, plan_id TEXT, amount REAL NOT NULL CHECK(amount > 0), currency TEXT NOT NULL, direction TEXT NOT NULL CHECK(direction IN ('contribution','withdrawal')), occurred_at TEXT NOT NULL, note TEXT, linked_transaction_id TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS budgets (id TEXT PRIMARY KEY, category_id TEXT NOT NULL, month TEXT NOT NULL, limit_amount REAL NOT NULL CHECK(limit_amount > 0), currency TEXT NOT NULL, UNIQUE(category_id, month));
CREATE TABLE IF NOT EXISTS reminders (id TEXT PRIMARY KEY, plan_id TEXT, recurring_rule_id TEXT, schedule TEXT NOT NULL, local_notification_id TEXT);
CREATE TABLE IF NOT EXISTS recurring_rules (id TEXT PRIMARY KEY, template_json TEXT NOT NULL, cadence TEXT NOT NULL, next_run_at TEXT NOT NULL, confirmation_policy TEXT NOT NULL DEFAULT 'ask');
CREATE TABLE IF NOT EXISTS backup_metadata (id INTEGER PRIMARY KEY CHECK(id = 1), last_backup_at TEXT, last_backup_format TEXT, encryption_flag INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON transactions(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributions_plan ON contributions(plan_id, occurred_at DESC);
`;

const query = async (db, sql, values = []) => (await db.query(sql, values)).values || [];
const execute = async (sqlite, db, sql, values = []) => {
  await db.run(sql, values, false);
  if (sqlite.platform === 'web') await sqlite.saveToStore(DATABASE_NAME);
};

async function migrateLegacy(db, sqlite) {
  const done = await query(db, "SELECT value FROM app_meta WHERE key = 'legacy_localstorage_v1'");
  if (done.length) return;

  const oldTransactionsValue = window.localStorage.getItem('expense_tracker_transactions_v1');
  const oldProfileValue = window.localStorage.getItem('expense_tracker_local_profile_v1') || window.localStorage.getItem('expense_tracker_user_data');
  const sourceFound = Boolean(oldTransactionsValue || oldProfileValue);
  const oldTransactions = JSON.parse(oldTransactionsValue || '[]');
  const oldProfile = JSON.parse(oldProfileValue || 'null');
  if (!Array.isArray(oldTransactions)) throw new Error('Your previous local transaction data is not a valid list. Original data was left untouched.');

  let written = 0;
  const importedIds = new Set();
  await db.beginTransaction();
  try {
    for (const row of oldTransactions) {
      const type = row.type === 'savings' ? 'contribution' : row.type;
      const recordId = String(row.transaction_id || crypto.randomUUID());
      if (!Number.isFinite(Number(row.amount)) || Number(row.amount) <= 0 || !['income', 'expense', 'contribution'].includes(type) || importedIds.has(recordId)) {
        throw new Error(`A previous record could not be imported (${written} of ${oldTransactions.length} imported). Original data was left untouched.`);
      }
      importedIds.add(recordId);
      if (type === 'contribution') {
        await db.run(
          'INSERT INTO contributions (id, plan_id, amount, currency, direction, occurred_at, note, created_at) VALUES (?, NULL, ?, ?, ?, ?, ?, ?)',
          [recordId, Number(row.amount), 'INR', 'contribution', row.date || new Date().toISOString(), row.name || '', new Date().toISOString()],
          false,
        );
      } else {
        await db.run(
          'INSERT INTO transactions (id, type, amount, currency, occurred_at, description, emoji, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [recordId, type, Number(row.amount), 'INR', row.date || new Date().toISOString(), String(row.name || 'Untitled'), row.emoji || null, new Date().toISOString()],
          false,
        );
      }
      const check = type === 'contribution'
        ? await db.query('SELECT id FROM contributions WHERE id = ?', [recordId])
        : await db.query('SELECT id FROM transactions WHERE id = ?', [recordId]);
      if (!check.values?.length) throw new Error(`A previous record could not be verified (${written} of ${oldTransactions.length}). Original data was left untouched.`);
      written += 1;
    }

    const displayName = oldProfile?.name?.trim() || oldProfile?.displayName?.trim() || 'My account';
    const profileId = String(oldProfile?.id || 'local');
    await db.run('INSERT OR IGNORE INTO profiles (id, display_name, base_currency, created_at) VALUES (?, ?, ?, ?)', [profileId, displayName, 'INR', new Date().toISOString()], false);
    await db.run('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)', ['legacy_localstorage_v1', JSON.stringify({ read: oldTransactions.length, written, sourceFound, migratedAt: new Date().toISOString(), confirmed: false })], false);
    await db.commitTransaction();
    if (sqlite.platform === 'web') await sqlite.saveToStore(DATABASE_NAME);
  } catch (error) {
    await db.rollbackTransaction();
    throw error;
  }
}

export async function getFinanceDatabase() {
  if (!connectionPromise) connectionPromise = (async () => {
    if (typeof window === 'undefined') throw new Error('The local database is available after the app opens on this device.');
    const [{ Capacitor }, { CapacitorSQLite, SQLiteConnection }] = await Promise.all([
      import('@capacitor/core'),
      import('@capacitor-community/sqlite'),
    ]);
    const sqlite = new SQLiteConnection(CapacitorSQLite);
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      const { defineCustomElements } = await import('jeep-sqlite/loader');
      defineCustomElements(window);
      if (!document.querySelector('jeep-sqlite')) document.body.appendChild(document.createElement('jeep-sqlite'));
      await customElements.whenDefined('jeep-sqlite');
      await sqlite.initWebStore();
    }
    const consistency = await sqlite.checkConnectionsConsistency();
    const isConnection = await sqlite.isConnection(DATABASE_NAME, false);
    const db = consistency.result && isConnection.result
      ? await sqlite.retrieveConnection(DATABASE_NAME, false)
      : await sqlite.createConnection(DATABASE_NAME, false, 'no-encryption', DATABASE_VERSION, false);
    await db.open();
    await db.execute(schema);
    await db.run('INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?)', [DATABASE_VERSION, new Date().toISOString()], false);
    await db.run('INSERT OR IGNORE INTO accounts (id, name, type, currency, created_at) VALUES (?, ?, ?, ?, ?)', ['cash', 'Cash', 'cash', 'INR', new Date().toISOString()], false);
    await db.run("INSERT OR IGNORE INTO categories (id, name, kind, is_user_created, icon) VALUES ('income-other','Other income','income',0,'💰'),('expense-other','Other','expense',0,'🧾')");
    await db.run('INSERT OR IGNORE INTO backup_metadata (id, encryption_flag) VALUES (1, 0)');
    await migrateLegacy(db, sqlite);
    if (platform === 'web') await sqlite.saveToStore(DATABASE_NAME);
    return { sqlite, db, platform };
  })().catch((error) => {
    connectionPromise = undefined;
    throw error;
  });
  return connectionPromise;
}

export async function dbQuery(sql, values = []) {
  const { db } = await getFinanceDatabase();
  return query(db, sql, values);
}

export async function dbRun(sql, values = []) {
  const { sqlite, db } = await getFinanceDatabase();
  return execute(sqlite, db, sql, values);
}

export async function dbBatch(operations) {
  const { sqlite, db, platform } = await getFinanceDatabase();
  await db.beginTransaction();
  try {
    for (const operation of operations) await db.run(operation.sql, operation.values || [], false);
    await db.commitTransaction();
    if (platform === 'web') await sqlite.saveToStore(DATABASE_NAME);
  } catch (error) {
    await db.rollbackTransaction();
    throw error;
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export async function dbTransaction(statements) {
  const { sqlite, db, platform } = await getFinanceDatabase();
  await db.execute(statements);
  if (platform === 'web') await sqlite.saveToStore(DATABASE_NAME);
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function dispatchFinanceChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export const FINANCE_DATABASE_NAME = DATABASE_NAME;
