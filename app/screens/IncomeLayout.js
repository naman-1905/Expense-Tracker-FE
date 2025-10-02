import React from 'react'
import IncomeChartCard from '../cards/IncomeChartCard'
import IncomeSourcesCard from '../cards/IncomeSourcesCard'

function IncomeLayout() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-black space-y-6 py-6">
      <IncomeChartCard />
      <IncomeSourcesCard />
    </div>
    </div>
  )
}

export default IncomeLayout
