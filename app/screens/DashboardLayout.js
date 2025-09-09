import React from 'react'
import Summary from '../cards/Summary'
import FinanceOverview from '../cards/FinanceOverview'
import TransactionCard from '../cards/TransactionCard'

function DashboardLayout() {
  return (
    <div className='text-black'>
      <Summary/>
      <div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FinanceOverview/>
        <TransactionCard/>
      </div>
    </div>
  )
}

export default DashboardLayout