import React, { useState } from 'react'
import { Wallet, Pencil, Check, X } from 'lucide-react'
import { useCurrency } from '../context/CurrencyContext'

function SavingsTargetCard({ saved = 6300 }) {
  const { formatAmount } = useCurrency()

  // Saved (locked) values
  const [savedTarget, setSavedTarget] = useState(10000)
  const [savedStartDate, setSavedStartDate] = useState('')
  const [savedEndDate, setSavedEndDate] = useState('')

  // Draft values — only active while editing, null when locked
  const [draft, setDraft] = useState(null)
  const isEditing = draft !== null

  const progress = savedTarget > 0
    ? Math.min(Math.round((saved / savedTarget) * 100), 100)
    : 0

  const handleEdit = () => {
    // Seed draft with current saved values so all fields are pre-filled
    setDraft({
      target: String(savedTarget),
      startDate: savedStartDate,
      endDate: savedEndDate,
    })
  }

  const handleSave = () => {
    const parsed = parseFloat(draft.target)
    if (!isNaN(parsed) && parsed > 0) {
      setSavedTarget(parsed)
    }
    setSavedStartDate(draft.startDate)
    setSavedEndDate(draft.endDate)
    setDraft(null)
  }

  const handleCancel = () => {
    setDraft(null) // discard all draft changes, revert to saved values
  }

  const updateDraft = (field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-8 border transition-all duration-300 w-full max-w-screen ${
      isEditing
        ? 'border-purple-300 shadow-md ring-2 ring-purple-100'
        : 'border-gray-100 hover:shadow-md'
    }`}>

      {/* Header row */}
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

      {/* Amounts */}
      <div className="flex items-end justify-between mb-2">
        <span className="text-lg font-bold text-gray-600">
          {formatAmount(saved)}
        </span>

        <div className="flex items-center gap-1">
          <span className="text-large text-gray-800 font-medium">of</span>
          {isEditing ? (
            <input
              type="number"
              value={draft.target}
              onChange={(e) => updateDraft('target', e.target.value)}
              className="w-24 text-sm font-semibold text-gray-700 border-b border-purple-400 bg-transparent focus:outline-none text-right"
              placeholder="Target"
            />
          ) : (
            <span className="text-2xl text-gray-800 font-medium">
              {formatAmount(savedTarget)}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-1">
        <div
          className="h-2.5 rounded-full bg-purple-600 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-purple-500 font-semibold text-right mb-5">{progress}% reached</p>

      {/* Date range */}
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

      {/* Save / Cancel — only visible in edit mode */}
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