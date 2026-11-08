import React from 'react'
import SavingsTargetCard from '../cards/SavingsTargetCard'
import SavingsSourcesCard from '../cards/SavingsSourcesCard'

function SavingsLayout() {
  return (
<div className="w-full max-w-7xl mx-auto space-y-6 py-6">
<SavingsTargetCard/>
<SavingsSourcesCard/>
</div>
  )
}

export default SavingsLayout
