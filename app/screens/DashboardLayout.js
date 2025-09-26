import React, { useState, useEffect } from 'react'
import Summary from '../cards/Summary'
import FinanceOverview from '../cards/FinanceOverview'
import TransactionCard from '../cards/TransactionCard'

function DashboardLayout() {
  const [financialData, setFinancialData] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = JSON.parse(localStorage.getItem('expense_tracker_user_data'));
      if (!userData?.id) {
        throw new Error('User not authenticated');
      }

      const [balanceRes, incomeRes, expensesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_HISTORY_API}/api/history/balance?user_id=${userData.id}`),
        fetch(`${process.env.NEXT_PUBLIC_HISTORY_API}/api/history/income?user_id=${userData.id}`),
        fetch(`${process.env.NEXT_PUBLIC_HISTORY_API}/api/history/expenses?user_id=${userData.id}`)
      ]);

      const [balance, income, expenses] = await Promise.all([
        balanceRes.json(),
        incomeRes.json(),
        expensesRes.json()
      ]);

      setFinancialData({
        totalBalance: balance.balance || 0,
        totalIncome: income.total_income || 0,
        totalExpenses: expenses.total_expenses || 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  return (
    <div className='text-black'>
      <Summary 
        data={financialData}
        loading={loading}
        error={error}
        onRefresh={fetchFinancialData}
      />
      <div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FinanceOverview/>
        <TransactionCard/>
      </div>
    </div>
  )
}

export default DashboardLayout