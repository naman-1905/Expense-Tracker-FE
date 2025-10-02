import React from 'react'
import ExpenseChartCard from '../cards/ExpenseChartCard'
import ExpensesCard from '../cards/ExpenseSourcesCard'

function ExpenseLayout() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-black space-y-6 py-6">
        <ExpenseChartCard />
        <ExpensesCard />
      </div>
    </div>
  )
}

export default ExpenseLayout