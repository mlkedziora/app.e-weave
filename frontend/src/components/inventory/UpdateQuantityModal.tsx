// frontend/src/components/inventory/UpdateQuantityModal.tsx
import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

type UpdateQuantityModalProps = {
  materialId: string;
  currentLength: number;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function UpdateQuantityModal({
  materialId,
  currentLength = 0,
  onClose,
  onSuccess,
}: UpdateQuantityModalProps) {
  const [newLength, setNewLength] = useState<number>(currentLength);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handleSubmit = async () => {
    if (isNaN(newLength) || newLength === undefined || newLength < 0) {
      setError('Please enter a valid non-negative number for new length.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();

      const res = await fetch(`/api/materials/${materialId}/history`, { // Keep as is (assume proxy)
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          previousLength: currentLength,
          newLength,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to update: ${res.status} – ${data.message || await res.text()}`);
      }

      await res.json();
      console.log('[UpdateQuantityModal] Update successful');
      onSuccess?.(newLength); // ✅ Pass newLength to onSuccess
      onClose();
    } catch (err: any) {
      console.error('[UpdateQuantityModal] Error:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 p-6 overflow-y-auto shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Update Material Quantity</h2>

      <label className="block text-sm font-medium mb-1">
        New Length (in meters):
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        className="border p-2 rounded w-full mb-4"
        value={newLength ?? ''}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          setNewLength(isNaN(val) ? undefined : val);
        }}
      />

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <div className="flex gap-3 mt-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          className="border border-gray-400 px-4 py-2 rounded"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}