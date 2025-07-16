// frontend/src/components/inventory/MaterialDetail.tsx (minimal changes: already well-set for internal scroll; ensured consistency)
import React, { useState } from 'react'
import MaterialHistoryFull from './MaterialHistoryFull'
import UpdateQuantityModal from './UpdateQuantityModal'
import AdditionalMetrics from './AdditionalMetrics'
import EditNoteModal from './EditNoteModal'
import AddNoteModal from './AddNoteModal'
import AllNotesModal from './AllNotesModal'
import { useUser, useAuth } from '@clerk/clerk-react'

type MaterialDetailProps = {
  material: any
  onRefresh: (newLength?: number) => void
}

export default function MaterialDetail({ material, onRefresh }: MaterialDetailProps) {
  const [showFullHistory, setShowFullHistory] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showAdditionalMetrics, setShowAdditionalMetrics] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAllNotes, setShowAllNotes] = useState(false)

  const { user: currentUser } = useUser()
  const { getToken } = useAuth()

  const refreshNotes = () => {
    onRefresh()
  }

  if (!material) {
    return <div className="w-full p-4 text-gray-500 bg-white rounded-lg shadow-md text-black h-full flex items-center justify-center">Select a material to view details.</div> 
  }

  return (
    <div className="w-full space-y-10 bg-white p-6 rounded-lg shadow-md text-black overflow-y-auto h-full"> {/* Internal scroll, full height */}
      {/* FABRIC DETAILS */}
      <div>
        <h2 className="text-2xl font-bold mb-4">FABRIC DETAILS</h2>
        <div className="flex gap-6">
          <img
            src="/fabric.jpg"
            alt="Fabric"
            className="w-48 h-48 object-cover rounded"
          />
          <div className="space-y-2">
            <p><strong>Product Name:</strong> {material.name}</p>
            <p><strong>ID:</strong> {material.id}</p>
            <p><strong>Quantity Available:</strong> {material.length} m</p>
            <p><strong>Composition:</strong> {material.fiber}</p>
            <p><strong>Supplier:</strong> {material.supplier}</p>
            <p><strong>Price:</strong> ${material.pricePerMeter}</p>
            <p><strong>Certifications:</strong> {material.certifications || '—'}</p>
          </div>
        </div>
      </div>

      {/* ASSIGNED TASKS */}
      <div>
        <h2 className="text-2xl font-bold mb-2">ASSIGNED TASKS</h2>
        <div className="text-gray-600 italic">
          [Currently unlinked — backend does not relate tasks to materials]
        </div>
        <button className="mt-2 px-3 py-1 border rounded text-sm">Add Tasks</button>
      </div>

      {/* QUANTITY TRACKING */}
      <div>
        <h2 className="text-2xl font-bold mb-4">TRACK QUANTITY</h2>
        <div className="space-y-2">
          {Array.isArray(material.history) && material.history.length > 0 ? (
            material.history.slice(0, 6).map((entry: any, i: number) => (
              <div key={i} className="border p-3 rounded bg-gray-50">
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
        <button
          className="mt-3 px-3 py-1 border rounded text-sm"
          onClick={() => setShowUpdateModal(true)}
        >
          Update Quantity
        </button>
        <button
          className="mt-3 ml-2 px-3 py-1 border rounded text-sm"
          onClick={() => setShowFullHistory(true)}
        >
          Expand History
        </button>

        {showFullHistory && (
          <MaterialHistoryFull
            material={material}
            onClose={() => setShowFullHistory(false)}
          />
        )}

        {showUpdateModal && (
          <UpdateQuantityModal
            materialId={material.id}
            currentLength={material.length}
            onClose={() => setShowUpdateModal(false)}
            onSuccess={(newLength) => {
              console.log('[MaterialDetail] onSuccess triggered');
              setShowUpdateModal(false);
              onRefresh(newLength);
            }}
          />
        )}
      </div>

      {/* ENVIRONMENTAL IMPACT */}
      <div>
        <h2 className="text-2xl font-bold">ENVIRONMENTAL IMPACT</h2>
        <h3 className="text-sm text-gray-500 mb-4">Prototype – Based on PEFCR Guidelines</h3>
        <div className="grid grid-cols-2 gap-4">
          <p><strong>CO₂ eq (kg):</strong> {material.climateChange}</p>
          <p><strong>Fossil Energy (MJ):</strong> {material.fossilResourceDepletion}</p>
          <p><strong>Water (m³):</strong> {material.waterScarcity}</p>
          <p><strong>Freshwater P eq (kg):</strong> {material.freshwaterEutrophication}</p>
        </div>
        <button className="mt-3 px-3 py-1 border rounded text-sm" onClick={() => setShowAdditionalMetrics(true)}>
          Additional Metrics +
        </button>

        {showAdditionalMetrics && (
          <AdditionalMetrics material={material} onClose={() => setShowAdditionalMetrics(false)} />
        )}
      </div>

      {/* TRANSPORT */}
      <div>
        <h2 className="text-2xl font-bold">TRANSPORT</h2>
        <h3 className="text-sm text-gray-500 mb-2">Prototype – Based on User Input</h3>
        <img
          src="/map.png"
          alt="Transport Map"
          className="w-full max-w-md rounded mb-2"
        />
        <p className="text-sm text-gray-600">
          The transportation of this fabric to your studio used an estimated amount of resources based on fastest available transport information.
        </p>
      </div>

      {/* RECENT NOTES */}
      <div>
        <h2 className="text-2xl font-bold">RECENT NOTES</h2>
        <h3 className="text-sm text-gray-500 mb-4">Quantity Available: {material.length} m</h3>
        <div className="space-y-3">
          {material.materialNotes?.slice(0, 3).map((note: any, i: number) => (
            <div key={i} className="border p-3 rounded bg-gray-50">
              <p className="text-sm text-gray-600">
                {note.teamMember?.name || 'Unknown'} – {new Date(note.updatedAt || note.createdAt).toLocaleString()}
              </p>
              <p>{note.content}</p>
              {note.teamMember?.userId === currentUser?.id && (
                <div className="mt-1 flex gap-2">
                  <button
                    className="text-xs underline text-blue-600"
                    onClick={() => {
                      setSelectedNote(note);
                      setShowEditModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs underline text-red-500"
                    onClick={async () => {
                      if (confirm('Delete this note?')) {
                        try {
                          const token = await getToken({ template: 'backend-access' });  // ✅ Use template
                          const res = await fetch(`/materials/notes/${note.id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (!res.ok) {
                            const errorBody = await res.json(); // or res.text() if not JSON
                            console.error(`[DeleteNote] Failed: Status ${res.status}, Body:`, errorBody);
                            alert('Failed to delete');
                          } else {
                            console.log('[DeleteNote] Success');
                            refreshNotes();
                          }
                        } catch (err) {
                          console.error('[DeleteNote] Error:', err);
                          alert('Error deleting');
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="mt-3 px-3 py-1 border rounded text-sm" onClick={() => setShowAllNotes(true)}>
          Expand History
        </button>
        <button className="mt-3 ml-2 px-3 py-1 border rounded text-sm" onClick={() => setShowAddModal(true)}>
          Add Note
        </button>

        {showEditModal && selectedNote && (
          <EditNoteModal note={selectedNote} onClose={() => setShowEditModal(false)} onSuccess={() => { setShowEditModal(false); refreshNotes(); }} />
        )}

        {showAddModal && (
          <AddNoteModal materialId={material.id} onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); refreshNotes(); }} />
        )}

        {showAllNotes && (
          <AllNotesModal notes={material.materialNotes} onClose={() => setShowAllNotes(false)} />
        )}
      </div>
    </div>
  )
}