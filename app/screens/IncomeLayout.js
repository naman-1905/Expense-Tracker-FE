import React from 'react'
import IncomeChartCard from '../cards/IncomeChartCard'
import IncomeSourcesCard from '../cards/IncomeSourcesCard'

function IncomeLayout() {
  return (
    <div className="flex gap-4 text-black">
      <div className="flex-1">
        <IncomeChartCard />
      </div>
      <div className="flex-1">
        <IncomeSourcesCard />
      </div>
    </div>
  )
}

export default IncomeLayout
