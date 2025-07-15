import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'

type AllNotesModalProps = {
  notes: Note[]
  onClose: () => void
  onSuccess: () => void // Add this to refresh after edit/delete
}

function AllNotesModal({ notes, onClose, onSuccess }: AllNotesModalProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const { getToken, userId: currentUserId } = useAuth()

  const handleDelete = async (noteId: string) => {
    if (confirm('Delete this note?')) {
      try {
        const token = await getToken()
        const res = await fetch(`http://localhost:3000/projects/notes/${noteId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          throw new Error('Failed to delete')
        }
        onSuccess() // Refresh notes
      } catch (err) {
        console.error('Error deleting note:', err)
        alert('Error deleting')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md max-w-lg w-full max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">All Notes</h2>
        <div className="space-y-3">
          {notes.map((note, i) => (
            <div key={i} className="border p-3 rounded bg-gray-50">
              <p className="text-sm text-gray-600">
                {note.teamMember?.name || 'Unknown'} – {new Date(note.updatedAt || note.createdAt).toLocaleString()}
              </p>
              <p>{note.content}</p>
              {note.teamMember?.id === currentUserId && (
                <div className="mt-1 flex gap-2">
                  <button
                    className="text-xs underline text-blue-600"
                    onClick={() => {
                      setSelectedNote(note)
                      setShowEditModal(true)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs underline text-red-500"
                    onClick={() => handleDelete(note.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={onClose}>
          Close
        </button>
      </div>

      {showEditModal && selectedNote && (
        <EditNoteModal
          note={selectedNote}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false)
            onSuccess() // Refresh notes
          }}
        />
      )}
    </div>
  )
}