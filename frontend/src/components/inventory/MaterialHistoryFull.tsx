// frontend/src/components/inventory/MaterialHistoryFull.tsx
import React from 'react'

type HistoryEntry = {
  id: string
  previousLength: number
  newLength: number
  changedAt: string
  teamMember?: {
    name: string
  }
}

type Material = {
  id: string
  history: HistoryEntry[]
}

type MaterialHistoryFullProps = {
  material: Material
  onClose: () => void
}

export default function MaterialHistoryFull({
  material,
  onClose
}: MaterialHistoryFullProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Full Quantity History</h2>
      <button
        className="absolute top-4 right-6 px-3 py-1 border rounded text-sm"
        onClick={onClose}
      >
        Close
      </button>

      <div className="space-y-4">
        {Array.isArray(material.history) && material.history.length > 0 ? (
          material.history.map((entry, i) => (
            <div key={entry.id || i} className="border p-4 rounded bg-gray-50">
              <p><strong>User Taking:</strong> {entry.teamMember?.name || 'Unknown'}</p>
              <p><strong>Previous Amount:</strong> {entry.previousLength} m</p>
              <p><strong>New Amount:</strong> {entry.newLength} m</p>
              <p><strong>Timestamp:</strong> {new Date(entry.changedAt).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p className="text-sm italic text-gray-500">No quantity history available.</p>
        )}
      </div>
    </div>
  )
}
