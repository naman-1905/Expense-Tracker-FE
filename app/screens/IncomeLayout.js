import React from 'react'
import IncomeChartCard from '../cards/IncomeChartCard'
import IncomeSourcesCard from '../cards/IncomeSourcesCard'

function IncomeLayout() {
  return (
    <div className="flex flex-col gap-6 text-black">
      <IncomeChartCard />
      <IncomeSourcesCard />
    </div>
  )
}

export default IncomeLayout
