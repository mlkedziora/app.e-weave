import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'

type EditNoteModalProps = {
  note: Note
  onClose: () => void
  onSuccess: () => void
}

function EditNoteModal({ note, onClose, onSuccess }: EditNoteModalProps) {
  const [content, setContent] = useState(note.content)
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:3000/projects/notes/${note.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        throw new Error('Failed to update note')
      }
      onSuccess()
    } catch (err) {
      console.error('Error updating note:', err)
      alert('Error updating note')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-bold mb-4">Edit Note</h2>
        <textarea
          className="w-full p-2 border rounded mb-4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 border rounded" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSubmit} disabled={loading}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}