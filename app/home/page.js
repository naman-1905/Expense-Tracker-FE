"use client";

import { useEffect, useRef, useState } from 'react';
import { ArchiveRestore, ChartNoAxesCombined, CircleHelp, CloudOff, Download, LayoutDashboard, Menu, PiggyBank, TrendingDown, TrendingUp, Upload, UserRound, WalletCards, X } from 'lucide-react';
import DashboardLayout from '../screens/DashboardLayout';
import IncomeLayout from '../screens/IncomeLayout';
import ExpenseLayout from '../screens/ExpenseLayout';
import SavingsLayout from '../screens/SavingsLayout';
import { useCurrency } from '../context/CurrencyContext';
import { downloadLocalBackup, getProfileLocal, importLocalBackup, saveProfileLocal } from '../api/utils/localStore';

const sections = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, caption: 'Your money at a glance' },
  { id: 'income', label: 'Income', icon: TrendingUp, caption: 'Track what comes in' },
  { id: 'expense', label: 'Expenses', icon: TrendingDown, caption: 'Know where it goes' },
  { id: 'savings', label: 'Savings', icon: PiggyBank, caption: 'Build toward your goals' },
];

export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: 'My account', email: 'Saved on this device' });
  const [restoreMessage, setRestoreMessage] = useState('');
  const fileInput = useRef(null);
  const { selectedCurrency, changeCurrency, currencies } = useCurrency();

  useEffect(() => setUser(getProfileLocal()), []);

  const selectSection = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const restoreBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const restored = importLocalBackup(JSON.parse(await file.text()));
      setUser(getProfileLocal());
      setRestoreMessage(`${restored} transactions restored on this device.`);
      window.setTimeout(() => setRestoreMessage(''), 4000);
    } catch (error) {
      setRestoreMessage(error.message || 'Could not restore this file.');
    } finally {
      event.target.value = '';
    }
  };

  const editProfile = () => {
    const name = window.prompt('Name for this local profile', user.name);
    if (name === null) return;
    setUser(saveProfileLocal({ ...user, name }));
  };

  const current = sections.find((section) => section.id === activeSection) || sections[0];

  return (
    <main className="app-shell">
      {isSidebarOpen && <button aria-label="Close navigation" className="sidebar-scrim" onClick={() => setSidebarOpen(false)} />}
      <aside className={`app-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><WalletCards size={22} /></div>
          <div><strong>pocket</strong><span>Money, in focus</span></div>
          <button className="icon-button sidebar-close" aria-label="Close menu" onClick={() => setSidebarOpen(false)}><X size={19} /></button>
        </div>

        <div className="workspace-card">
          <div className="avatar"><UserRound size={19} /></div>
          <div className="workspace-copy"><strong>{user.name}</strong><span>Personal workspace</span></div>
          <button className="profile-edit" title="Edit local profile" onClick={editProfile}>•••</button>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="primary-nav" aria-label="Main navigation">
          {sections.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => selectSection(id)} className={`nav-item ${activeSection === id ? 'active' : ''}`} aria-current={activeSection === id ? 'page' : undefined}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{id === 'dashboard' && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <section className="currency-panel">
          <label htmlFor="display-currency">DISPLAY CURRENCY</label>
          <select id="display-currency" value={selectedCurrency} onChange={(event) => changeCurrency(event.target.value)}>
            {currencies.map((currency) => <option key={currency.code} value={currency.code}>{currency.symbol} {currency.code}</option>)}
          </select>
          <p>Saved in INR · display conversion needs internet.</p>
        </section>

        <div className="backup-panel">
          <div className="backup-icon"><ArchiveRestore size={17} /></div>
          <div><strong>Your data stays here</strong><span>Only you can access this device’s records.</span></div>
          <button onClick={downloadLocalBackup} className="backup-link"><Download size={14} /> Export backup</button>
          <button onClick={() => fileInput.current?.click()} className="backup-link"><Upload size={14} /> Restore backup</button>
          <input ref={fileInput} type="file" accept="application/json,.json" onChange={restoreBackup} hidden />
        </div>

        <div className="sidebar-footnote"><CloudOff size={15} /><span>Works without an account or internet</span></div>
      </aside>

      <section className="app-main">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-divider">/</span><strong>{current.label}</strong></div>
          <div className="topbar-actions"><span className="local-status"><span /> Saved on this device</span><button className="icon-button help-button" title="Local mode" onClick={() => window.alert('Your transactions and preferences are stored on this device. Use Export backup to move a copy elsewhere.')}><CircleHelp size={18} /></button></div>
        </header>

        <div className="content-wrap">
          <div className="page-heading">
            <div><p className="eyebrow">{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</p><h1>{activeSection === 'dashboard' ? 'Your money, made clear.' : current.label}</h1><p className="page-subtitle">{activeSection === 'dashboard' ? 'A calm look at where you are and what’s next.' : current.caption}</p></div>
            <div className="heading-illustration"><ChartNoAxesCombined size={24} /></div>
          </div>
          {restoreMessage && <div className="restore-notice" role="status">{restoreMessage}</div>}
          {activeSection === 'dashboard' && <DashboardLayout />}
          {activeSection === 'income' && <IncomeLayout />}
          {activeSection === 'expense' && <ExpenseLayout />}
          {activeSection === 'savings' && <SavingsLayout />}
          <footer className="content-footer"><span>Private by design · Stored on this device</span><span>pocket · Personal finance</span></footer>
        </div>
      </section>

      <nav className="mobile-nav" aria-label="Quick navigation">
        {sections.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => selectSection(id)} className={activeSection === id ? 'active' : ''}><Icon size={19} /><span>{label === 'Overview' ? 'Home' : label}</span></button>)}
      </nav>
    </main>
  );
}
