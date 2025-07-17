// frontend/src/components/inventory/MaterialDetail.tsx
import React, { useState } from 'react'
import MaterialHistoryFull from './MaterialHistoryFull'
import UpdateQuantityModal from './UpdateQuantityModal'
import AdditionalMetrics from './AdditionalMetrics'
import EditNoteModal from './EditNoteModal'
import AddNoteModal from './AddNoteModal'
import AllNotesModal from './AllNotesModal'
import { useUser, useAuth } from '@clerk/clerk-react'
import ScrollablePanel from '../common/ScrollablePanel' // ✅ Use for panel + scroll
import EmptyPanel from '../common/EmptyPanel' // ✅ Use for no-material state
import Typography from '../common/Typography'
import StyledLink from '../common/StyledLink'

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
    return <EmptyPanel>Select a material to view details.</EmptyPanel> // ✅ Use reusable
  }

  return (
    <ScrollablePanel className="space-y-12"> {/* ✅ Increased spacing for airiness */}
      {/* FABRIC DETAILS */}
      <div>
        <Typography variant="20" weight="light" element="h2" className="tracking-[3px] mb-4 text-black">FABRIC DETAILS</Typography>
        <div className="flex gap-8"> {/* ✅ Increased gap for airiness */}
          <img
            src="/fabric.jpg"
            alt="Fabric"
            className="w-48 h-48 object-cover rounded"
          />
          <div className="space-y-4"> {/* ✅ Increased to space-y-4 for airiness */}
            <Typography variant="15" className="text-black">Product Name: {material.name}</Typography>
            <Typography variant="15" className="text-black">ID: {material.id}</Typography>
            <Typography variant="15" className="text-black">Quantity Available: {material.length} m</Typography>
            <Typography variant="15" className="text-black">Composition: {material.fiber}</Typography>
            <Typography variant="15" className="text-black">Supplier: {material.supplier}</Typography>
            <Typography variant="15" className="text-black">Price: ${material.pricePerMeter}</Typography>
            <Typography variant="15" className="text-black">Certifications: {material.certifications || '—'}</Typography>
          </div>
        </div>
      </div>

      {/* ASSIGNED TASKS */}
      <div>
        <Typography variant="20" weight="light" element="h2" className="tracking-[3px] mb-2 text-black">ASSIGNED TASKS</Typography>
        <Typography variant="13" className="text-black italic">
          [Currently unlinked — backend does not relate tasks to materials]
        </Typography>
        <StyledLink onClick={() => {}} className="mt-4 text-black block">Add Tasks</StyledLink> {/* ✅ Block for new line */}
      </div>

      {/* QUANTITY TRACKING */}
      <div>
        <Typography variant="20" weight="light" element="h2" className="tracking-[3px] mb-4 text-black">TRACK QUANTITY</Typography>
        <div className="space-y-4"> {/* ✅ Increased spacing */}
          {Array.isArray(material.history) && material.history.length > 0 ? (
            material.history.slice(0, 6).map((entry: any, i: number) => (
              <div key={i} className="border p-4 rounded bg-gray-50 space-y-2"> {/* ✅ Increased padding */}
                <Typography variant="15" className="text-black">User Taking: {entry.teamMember?.name || 'Unknown'}</Typography>
                <Typography variant="15" className="text-black">Previous Amount: {entry.previousLength} m</Typography>
                <Typography variant="15" className="text-black">New Amount: {entry.newLength} m</Typography>
                <Typography variant="15" className="text-black">Timestamp: {new Date(entry.changedAt).toLocaleString()}</Typography>
              </div>
            ))
          ) : (
            <Typography variant="13" className="text-black italic">No quantity history available.</Typography>
          )}
        </div>
        <StyledLink
          onClick={() => setShowUpdateModal(true)}
          className="mt-4 text-black block"
        >
          Update Quantity
        </StyledLink>
        <StyledLink
          onClick={() => setShowFullHistory(true)}
          className="mt-4 ml-0 text-black block" 
        >
          Expand History
        </StyledLink>

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
        <Typography variant="20" weight="light" element="h2" className="tracking-[3px] text-black">ENVIRONMENTAL IMPACT</Typography>
        <Typography variant="13" className="text-black mb-4">Prototype – Based on PEFCR Guidelines</Typography>
        <div className="grid grid-cols-2 gap-6"> {/* ✅ Increased gap */}
          <Typography variant="15" className="text-black">CO₂ eq (kg): {material.climateChange}</Typography>
          <Typography variant="15" className="text-black">Fossil Energy (MJ): {material.fossilResourceDepletion}</Typography>
          <Typography variant="15" className="text-black">Water (m³): {material.waterScarcity}</Typography>
          <Typography variant="15" className="text-black">Freshwater P eq (kg): {material.freshwaterEutrophication}</Typography>
        </div>
        <StyledLink onClick={() => setShowAdditionalMetrics(true)} className="mt-4 text-black block">
          Additional Metrics +
        </StyledLink>

        {showAdditionalMetrics && (
          <AdditionalMetrics material={material} onClose={() => setShowAdditionalMetrics(false)} />
        )}
      </div>

      {/* TRANSPORT */}
      <div>
        <Typography variant="20" weight="light" element="h2" className="tracking-[3px] text-black">TRANSPORT</Typography>
        <Typography variant="13" className="text-black mb-2">Prototype – Based on User Input</Typography>
        <img
          src="/map.png"
          alt="Transport Map"
          className="w-full max-w-md rounded mb-4" 
        />
        <Typography variant="13" className="text-black">
          The transportation of this fabric to your studio used an estimated amount of resources based on fastest available transport information.
        </Typography>
      </div>

      {/* RECENT NOTES */}
      <div>
        <Typography variant="20" weight="light" element="h2" className="tracking-[3px] text-black">RECENT NOTES</Typography>
        <Typography variant="13" className="text-black mb-4">Quantity Available: {material.length} m</Typography>
        <div className="space-y-4"> {/* ✅ Increased spacing */}
          {material.materialNotes?.slice(0, 3).map((note: any, i: number) => (
            <div key={i} className="border p-4 rounded bg-gray-50 space-y-2"> {/* ✅ Increased padding */}
              <Typography variant="13" className="text-black">
                {note.teamMember?.name || 'Unknown'} – {new Date(note.updatedAt || note.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="15" className="text-black">{note.content}</Typography>
              {note.teamMember?.userId === currentUser?.id && (
                <div className="mt-2 flex gap-4"> {/* ✅ Increased mt and gap */}
                  <StyledLink
                    onClick={() => {
                      setSelectedNote(note);
                      setShowEditModal(true);
                    }}
                    className="text-black text-[13px]"
                  >
                    Edit
                  </StyledLink>
                  <StyledLink
                    onClick={async () => {
                      if (confirm('Delete this note?')) {
                        try {
                          const token = await getToken({ template: 'backend-access' });
                          const res = await fetch(`/materials/notes/${note.id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (!res.ok) {
                            const errorBody = await res.json();
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
                    className="text-black text-[13px]"
                  >
                    Delete
                  </StyledLink>
                </div>
              )}
            </div>
          ))}
        </div>
        <StyledLink onClick={() => setShowAllNotes(true)} className="mt-4 text-black block">
          Expand History
        </StyledLink>
        <StyledLink onClick={() => setShowAddModal(true)} className="mt-4 ml-0 text-black block">
          Add Note
        </StyledLink>

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
    </ScrollablePanel>
  )
}