import React, { useState, useEffect } from 'react'
import { Wallet, Pencil, Check, X, Loader } from 'lucide-react'
import { getSavingsTransactionsDateRange } from '../api/utils/historyAPI'
import { useCurrency } from '../context/CurrencyContext'

function SavingsTargetCard() {
  const { formatAmount } = useCurrency()

  // Locked committed settings
  const [savedTarget, setSavedTarget] = useState(10000)
  const [savedStartDate, setSavedStartDate] = useState('')
  const [savedEndDate, setSavedEndDate] = useState('')

  // Draft — null when locked, populated when editing
  const [draft, setDraft] = useState(null)
  const isEditing = draft !== null

  // Amount saved in the period — fetched independently
  const [periodTotal, setPeriodTotal] = useState(0)
  const [fetching, setFetching] = useState(false)

  const progress = savedTarget > 0
    ? Math.min(Math.round((periodTotal / savedTarget) * 100), 100)
    : 0

  // Fetch savings-type transactions for the committed date range
  const fetchPeriodTotal = async (start, end) => {
    if (!start || !end) {
      setPeriodTotal(0)
      return
    }
    try {
      setFetching(true)
      const cacheKey = `piggyPeriodTotal_${start}_${end}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) setPeriodTotal(JSON.parse(cached))

      const data = await getSavingsTransactionsDateRange(start, end, 1000)
      const total = (data.transactions || [])
        .reduce((sum, t) => sum + t.amount, 0)

      setPeriodTotal(total)
      localStorage.setItem(cacheKey, JSON.stringify(total))
    } catch (err) {
      console.error('Error fetching period total:', err)
    } finally {
      setFetching(false)
    }
  }

  // Re-fetch whenever the committed period changes
  useEffect(() => {
    fetchPeriodTotal(savedStartDate, savedEndDate)
  }, [savedStartDate, savedEndDate])

  const handleEdit = () => {
    setDraft({
      target: String(savedTarget),
      startDate: savedStartDate,
      endDate: savedEndDate,
    })
  }

  const handleSave = () => {
    const parsed = parseFloat(draft.target)
    if (!isNaN(parsed) && parsed > 0) setSavedTarget(parsed)
    setSavedStartDate(draft.startDate)
    setSavedEndDate(draft.endDate)
    setDraft(null)
  }

  const handleCancel = () => setDraft(null)

  const updateDraft = (field, value) =>
    setDraft(prev => ({ ...prev, [field]: value }))

  const getPeriodLabel = () => {
    if (!savedStartDate || !savedEndDate) return null
    const fmt = (d) =>
      new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${fmt(savedStartDate)} – ${fmt(savedEndDate)}`
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-8 border transition-all duration-300 w-full ${
      isEditing
        ? 'border-purple-300 shadow-md ring-2 ring-purple-100'
        : 'border-gray-100 hover:shadow-md'
    }`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
          <Wallet className="text-purple-500 w-5 h-5" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 text-sm tracking-wide">Piggy Bank Target</span>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="text-gray-300 hover:text-purple-400 transition-colors"
              title="Edit target & period"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Amounts row */}
      <div className="flex items-end justify-between mb-2">
        {/* Saved so far for the period */}
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-bold text-gray-800">
              {formatAmount(periodTotal)}
            </span>
            {fetching && <Loader className="w-3.5 h-3.5 text-purple-400 animate-spin" />}
          </div>
        </div>

        {/* Target — editable in draft mode */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400 font-medium">of</span>
          {isEditing ? (
            <input
              type="number"
              value={draft.target}
              onChange={(e) => updateDraft('target', e.target.value)}
              className="w-28 text-xl font-semibold text-gray-700 border-b border-purple-400 bg-transparent focus:outline-none text-right"
              placeholder="Target"
            />
          ) : (
            <span className="text-2xl font-semibold text-gray-700">
              {formatAmount(savedTarget)}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-1">
        <div
          className="h-2.5 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Period label + % */}
      <div className="flex items-center justify-between mb-5">
        {getPeriodLabel() && !isEditing ? (
          <p className="text-xs text-gray-400">{getPeriodLabel()}</p>
        ) : <span />}
        <p className="text-xs text-purple-500 font-semibold">{progress}% reached</p>
      </div>

      {/* Date range — locked unless editing */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
          <input
            type="date"
            value={isEditing ? draft.startDate : savedStartDate}
            onChange={(e) => updateDraft('startDate', e.target.value)}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-700 focus:outline-none transition-colors ${
              isEditing
                ? 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-purple-400 cursor-pointer'
                : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
          <input
            type="date"
            value={isEditing ? draft.endDate : savedEndDate}
            min={isEditing ? draft.startDate : undefined}
            onChange={(e) => updateDraft('endDate', e.target.value)}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-700 focus:outline-none transition-colors ${
              isEditing
                ? 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-purple-400 cursor-pointer'
                : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          />
        </div>
      </div>

      {/* Save / Cancel */}
      {isEditing && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={handleCancel}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      )}

    </div>
  )
}

export default SavingsTargetCard