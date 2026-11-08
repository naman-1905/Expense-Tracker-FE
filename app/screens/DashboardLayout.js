import React from 'react';
import Summary from '../cards/Summary';
import FinanceOverview from '../cards/FinanceOverview';
import TransactionCard from '../cards/TransactionCard';

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Summary />
      <div className="dashboard-grid">
        <FinanceOverview />
        <TransactionCard />
      </div>
    </div>
  );
}
