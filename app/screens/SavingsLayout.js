"use client";

import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Check, CircleDollarSign, Flag, Heart, MoreHorizontal, PiggyBank, Plus, Target, Trash2 } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { addPlanContribution, createSavingsPlan, deleteContribution, deleteSavingsPlan, listPlanContributions, listSavingsPlans, updateSavingsPlan } from '../api/utils/savingsAPI';
import { subscribeToLocalChanges } from '../api/utils/localStore';
import SavingsSourcesCard from '../cards/SavingsSourcesCard';

const starterPlans = [
  { icon: '✈️', name: 'Plane ticket', hint: 'A little closer to your next adventure' },
  { icon: '🛟', name: 'Emergency fund', hint: 'A softer landing for unexpected days' },
  { icon: '💻', name: 'New laptop', hint: 'Save at your own pace' },
];

function SavingsLayout() {
  const { formatAmount } = useCurrency();
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState({ name: '', target_amount: '', description: '', target_date: '', icon: '🎯' });

  const refresh = useCallback(async () => {
    try {
      const records = await listSavingsPlans();
      setPlans(records);
      const entries = await Promise.all(records.map(async (plan) => [plan.id, await listPlanContributions(plan.id)]));
      setHistory(Object.fromEntries(entries));
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'Could not load savings plans on this device.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    return subscribeToLocalChanges(refresh);
  }, [refresh]);

  const submitPlan = async (event) => {
    event.preventDefault();
    try {
      await createSavingsPlan(draft);
      setDraft({ name: '', target_amount: '', description: '', target_date: '', icon: '🎯' });
      setShowForm(false);
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  const contribute = async (plan) => {
    const raw = window.prompt(`How much would you like to add to “${plan.name}”?`, '500');
    if (raw === null) return;
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount <= 0) { setError('Enter an amount greater than zero.'); return; }
    const note = window.prompt('Add a note (optional)', '');
    if (note === null) return;
    try { await addPlanContribution({ plan_id: plan.id, amount, note }); }
    catch (saveError) { setError(saveError.message); }
  };

  const withdraw = async (plan) => {
    const raw = window.prompt(`How much are you withdrawing from “${plan.name}”?`, '');
    if (raw === null) return;
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount <= 0) { setError('Enter an amount greater than zero.'); return; }
    const note = window.prompt('What was this withdrawal for? (optional)', '');
    if (note === null) return;
    try { await addPlanContribution({ plan_id: plan.id, amount, note, direction: 'withdrawal' }); }
    catch (saveError) { setError(saveError.message); }
  };

  const editPlan = async (plan) => {
    const name = window.prompt('Plan name', plan.name);
    if (name === null) return;
    const target = window.prompt('Target amount in INR', String(plan.target_amount));
    if (target === null) return;
    try { await updateSavingsPlan(plan.id, { name: name.trim(), target_amount: Number(target) }); }
    catch (saveError) { setError(saveError.message); }
  };

  const removePlan = async (plan) => {
    if (!window.confirm(`Archive “${plan.name}”? Its contribution history will remain as unallocated savings.`)) return;
    try { await deleteSavingsPlan(plan.id); }
    catch (saveError) { setError(saveError.message); }
  };

  const removeContribution = async (plan, contribution) => {
    if (!window.confirm('Delete this contribution from the plan history?')) return;
    try { await deleteContribution(contribution.id); }
    catch (saveError) { setError(saveError.message); }
  };

  const totalSaved = plans.reduce((sum, plan) => sum + Number(plan.saved_amount || 0), 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 py-6">
      <section className="savings-intro">
        <div className="savings-intro-copy"><span className="savings-intro-icon"><PiggyBank size={21} /></span><div><p className="eyebrow">YOUR PLANS, YOUR PACE</p><h2>Give your savings a reason.</h2><p>Name something you’re looking forward to, then add money whenever you can.</p></div></div>
        <div className="savings-total"><span>Saved toward plans</span><strong>{formatAmount(totalSaved)}</strong><small>Kept on this device</small></div>
      </section>

      {error && <div className="restore-notice" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss message">×</button></div>}

      <section className="savings-section">
        <div className="savings-section-heading"><div><p className="eyebrow">THINGS YOU’RE SAVING FOR</p><h2>Your savings plans</h2></div><button className="primary-action" onClick={() => setShowForm((value) => !value)}><Plus size={17} />{showForm ? 'Close' : 'New plan'}</button></div>

        {showForm && <form onSubmit={submitPlan} className="plan-create-form">
          <label>Plan name<input required maxLength={80} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Save for a plane ticket" /></label>
          <label>Target amount (INR)<input type="number" required min="0.01" step="0.01" value={draft.target_amount} onChange={(event) => setDraft({ ...draft, target_amount: event.target.value })} placeholder="50000" /></label>
          <label>Target date <span className="optional-label">optional</span><input type="date" value={draft.target_date} onChange={(event) => setDraft({ ...draft, target_date: event.target.value })} /></label>
          <label>Icon<select value={draft.icon} onChange={(event) => setDraft({ ...draft, icon: event.target.value })}>{['🎯','✈️','🏠','🛟','💻','🎓','🚗','🌴','💍','🎁'].map((icon) => <option key={icon}>{icon}</option>)}</select></label>
          <label className="plan-description-field">A note for yourself <span className="optional-label">optional</span><input maxLength={255} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="A small reminder of why this matters" /></label>
          <div className="plan-create-actions"><button type="button" className="secondary-action" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="primary-action"><Check size={16} />Create plan</button></div>
        </form>}

        {loading ? <div className="savings-empty">Loading plans saved on this device…</div> : plans.length === 0 ? <div className="savings-empty-state"><div className="empty-state-badge"><Target size={23} /></div><h3>Start with something you want.</h3><p>Your plan could be a plane ticket, a rainy-day cushion, or anything that matters to you.</p><div className="starter-ideas">{starterPlans.map((idea) => <button key={idea.name} onClick={() => { setDraft({ ...draft, name: `Save for ${idea.name.toLowerCase()}`, icon: idea.icon, description: idea.hint }); setShowForm(true); }}><span>{idea.icon}</span><span><strong>{idea.name}</strong><small>{idea.hint}</small></span><Plus size={15} /></button>)}</div></div> : <div className="savings-plan-grid">{plans.map((plan) => {
          const saved = Number(plan.saved_amount || 0);
          const target = Number(plan.target_amount || 0);
          const progress = target > 0 ? Math.min(100, Math.max(0, Math.round((saved / target) * 100))) : 0;
          const remaining = Math.max(0, target - saved);
          return <article className="savings-plan-card" key={plan.id} style={{ '--plan-color': plan.color || '#7957f3' }}>
            <div className="plan-card-top"><span className="plan-icon">{plan.icon || '🎯'}</span><div className="plan-menu"><button aria-label={`Edit ${plan.name}`} onClick={() => editPlan(plan)} title="Edit plan"><MoreHorizontal size={20} /></button><button aria-label={`Archive ${plan.name}`} onClick={() => removePlan(plan)} title="Archive plan"><Trash2 size={16} /></button></div></div>
            <div className="plan-card-title"><h3>{plan.name}</h3><span>{plan.status}</span></div>
            {plan.description && <p className="plan-card-description">{plan.description}</p>}
            <div className="plan-saved-amount"><strong>{formatAmount(saved)}</strong><span>of {formatAmount(target)}</span></div>
            <div className="plan-progress-track"><span style={{ width: `${progress}%` }} /></div>
            <div className="plan-progress-meta"><span>{progress}% saved</span><span>{remaining ? `${formatAmount(remaining)} to go` : 'Goal reached 🎉'}</span></div>
            {plan.target_date && <p className="plan-deadline"><CalendarDays size={14} /> Aim for {new Date(`${plan.target_date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
            <div className="plan-actions"><button className="primary-action" onClick={() => contribute(plan)}><Plus size={15} />Add savings</button><button className="secondary-action" onClick={() => withdraw(plan)}>Withdraw</button></div>
            <div className="plan-history"><strong>Recent activity</strong>{(history[plan.id] || []).length === 0 ? <p>No contributions yet. Add the first one whenever you’re ready.</p> : (history[plan.id] || []).slice(0, 4).map((entry) => <div className="plan-history-row" key={entry.id}><span><CircleDollarSign size={15} />{entry.note || (entry.direction === 'withdrawal' ? 'Withdrawal' : 'Added to plan')}<small>{new Date(entry.occurred_at).toLocaleDateString()}</small></span><b className={entry.direction === 'withdrawal' ? 'withdrawal-amount' : ''}>{entry.direction === 'withdrawal' ? '−' : '+'}{formatAmount(entry.amount)}<button aria-label="Delete activity" onClick={() => removeContribution(plan, entry)}><Trash2 size={13} /></button></b></div>)}</div>
          </article>;
        })}</div>}
      </section>

      <div className="savings-privacy-note"><Heart size={16} /><span>Your goals and contributions are saved only on this device. Add a note like “from this week’s pay” to remember why you saved.</span></div>
      <SavingsSourcesCard />
    </div>
  );
}

export default SavingsLayout;
