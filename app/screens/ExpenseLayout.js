import React from 'react'
import ExpenseChartCard from '../cards/ExpenseChartCard'
import ExpensesCard from '../cards/ExpenseSourcesCard'

function ExpenseLayout() {
  return (
    <div className="text-black space-y-6">
      <ExpenseChartCard />
      <ExpensesCard />
    </div>
  )
}

export default ExpenseLayout
