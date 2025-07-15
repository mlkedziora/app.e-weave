import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

type AddNoteModalProps = {
  materialId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddNoteModal({ materialId, onClose, onSuccess }: AddNoteModalProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();  // ✅ Moved to top level

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const token = await getToken({ template: 'backend-access' });
      const res = await fetch(`/api/materials/${materialId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const errorBody = await res.json();
        console.error(`[AddNote] Failed: Status ${res.status}, Body:`, errorBody);
        alert('Failed to add note');
      } else {
        console.log('[AddNote] Success');
        onSuccess();
      }
    } catch (err) {
      console.error('Error adding note:', err);
      alert('Error adding note');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-bold mb-4">Add Note</h2>
        <textarea
          className="w-full p-2 border rounded mb-4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note..."
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 border rounded" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSubmit} disabled={loading}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}