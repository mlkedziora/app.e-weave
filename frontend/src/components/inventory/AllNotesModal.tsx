import React from 'react';

type AllNotesModalProps = {
  notes: any[];
  onClose: () => void;
};

export default function AllNotesModal({ notes, onClose }: AllNotesModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md max-w-lg w-full max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">All Notes</h2>
        <div className="space-y-3">
          {notes.map((note: any, i: number) => (
            <div key={i} className="border p-3 rounded bg-gray-50">
              <p className="text-sm text-gray-600">
                {note.teamMember?.name || 'Unknown'} – {new Date(note.updatedAt || note.createdAt).toLocaleString()}
              </p>
              <p>{note.content}</p>
            </div>
          ))}
        </div>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}