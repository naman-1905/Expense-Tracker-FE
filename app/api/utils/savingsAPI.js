import { dbBatch, dbQuery, dispatchFinanceChange } from '../../lib/financeDatabase';

const uuid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export async function listSavingsPlans() {
  return dbQuery(`SELECT p.*, p.starting_amount + COALESCE(SUM(CASE WHEN c.direction='contribution' THEN c.amount ELSE -c.amount END),0) AS saved_amount
    FROM savings_plans p LEFT JOIN contributions c ON c.plan_id = p.id
    WHERE p.status != 'archived' GROUP BY p.id ORDER BY p.priority, COALESCE(p.target_date,'9999-12-31'), p.created_at DESC`);
}

export async function createSavingsPlan(data) {
  const name = String(data.name || '').trim();
  const target = Number(data.target_amount);
  if (!name || !Number.isFinite(target) || target <= 0) throw new Error('Add a plan name and a target greater than zero.');
  const timestamp = new Date().toISOString();
  const plan = { id: uuid(), name, description: data.description || null, target_amount: target, target_currency: data.target_currency || 'INR', start_date: data.start_date || timestamp.slice(0, 10), target_date: data.target_date || null, starting_amount: Number(data.starting_amount || 0), priority: Number(data.priority || 2), color: data.color || '#7957f3', icon: data.icon || '🎯', status: 'active', created_at: timestamp, updated_at: timestamp };
  await dbBatch([{ sql: 'INSERT INTO savings_plans (id,name,description,target_amount,target_currency,start_date,target_date,starting_amount,priority,color,icon,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', values: Object.values(plan) }]);
  return plan;
}

export async function updateSavingsPlan(id, updates) {
  const allowed = ['name', 'description', 'target_amount', 'target_currency', 'start_date', 'target_date', 'starting_amount', 'priority', 'color', 'icon', 'status'];
  const keys = Object.keys(updates).filter((key) => allowed.includes(key));
  if (!keys.length) return;
  const values = keys.map((key) => updates[key]);
  const assignments = keys.map((key) => `${key} = ?`).join(', ');
  await dbBatch([{ sql: `UPDATE savings_plans SET ${assignments}, updated_at = ? WHERE id = ?`, values: [...values, new Date().toISOString(), id] }]);
  dispatchFinanceChange();
}

export async function deleteSavingsPlan(id) {
  await dbBatch([
    { sql: 'UPDATE contributions SET plan_id = NULL WHERE plan_id = ?', values: [id] },
    { sql: "UPDATE savings_plans SET status = 'archived', updated_at = ? WHERE id = ?", values: [new Date().toISOString(), id] },
  ]);
}

export async function listPlanContributions(planId) {
  return dbQuery('SELECT * FROM contributions WHERE plan_id = ? ORDER BY occurred_at DESC', [planId]);
}

export async function addPlanContribution(data) {
  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter an amount greater than zero.');
  const record = { id: uuid(), plan_id: data.plan_id || null, amount, currency: data.currency || 'INR', direction: data.direction === 'withdrawal' ? 'withdrawal' : 'contribution', occurred_at: data.occurred_at || new Date().toISOString(), note: String(data.note || '').trim() || null, created_at: new Date().toISOString() };
  await dbBatch([{ sql: 'INSERT INTO contributions (id,plan_id,amount,currency,direction,occurred_at,note,created_at) VALUES (?,?,?,?,?,?,?,?)', values: Object.values(record) }]);
  return record;
}

export async function updateContribution(id, data) {
  const fields = ['plan_id', 'amount', 'currency', 'direction', 'occurred_at', 'note'].filter((key) => key in data);
  if (!fields.length) return;
  const values = fields.map((key) => data[key]);
  await dbBatch([{ sql: `UPDATE contributions SET ${fields.map((key) => `${key} = ?`).join(', ')} WHERE id = ?`, values: [...values, id] }]);
}

export async function deleteContribution(id) {
  await dbBatch([{ sql: 'DELETE FROM contributions WHERE id = ?', values: [id] }]);
}

export async function allocateUnallocatedContribution(id, planId, amount) {
  const rows = await dbQuery('SELECT * FROM contributions WHERE id = ? AND plan_id IS NULL', [id]);
  if (!rows.length) throw new Error('That unallocated contribution was not found.');
  const source = rows[0];
  const allocation = Number(amount);
  if (!Number.isFinite(allocation) || allocation <= 0 || allocation > Number(source.amount)) throw new Error('Choose an amount up to the unallocated balance.');
  if (allocation === Number(source.amount)) await updateContribution(id, { plan_id: planId });
  else await dbBatch([
    { sql: 'UPDATE contributions SET amount = amount - ? WHERE id = ?', values: [allocation, id] },
    { sql: 'INSERT INTO contributions (id,plan_id,amount,currency,direction,occurred_at,note,created_at) VALUES (?,?,?,?,?,?,?,?)', values: [uuid(), planId, allocation, source.currency, source.direction, source.occurred_at, source.note, new Date().toISOString()] },
  ]);
}
