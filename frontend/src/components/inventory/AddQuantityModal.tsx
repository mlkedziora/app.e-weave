// frontend/src/components/inventory/AddQuantityModal.tsx
import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Typography from '../common/Typography';
import UnderlinedHeader from '../common/UnderlinedHeader';
import ActionButtonsRow from '../common/ActionButtonsRow';
import BlurryOverlayPanel from '../common/BlurryOverlayPanel';
import StyledLink from '../common/StyledLink';

type AddQuantityModalProps = {
  materialId: string;
  currentLength: number;
  onClose: () => void;
  onSuccess?: (newLength: number) => void;
};

export default function AddQuantityModal({
  materialId,
  currentLength = 0,
  onClose,
  onSuccess,
}: AddQuantityModalProps) {
  const [amountToAdd, setAmountToAdd] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handleSubmit = async () => {
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      setError('Please enter a valid positive number to add.');
      return;
    }

    const newLength = currentLength + amountToAdd;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();

      const res = await fetch(`/api/materials/${materialId}/history`, {
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
      console.log('[AddQuantityModal] Update successful');
      onSuccess?.(newLength);
      onClose();
    } catch (err: any) {
      console.error('[AddQuantityModal] Error:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlurryOverlayPanel draggable={true} onClose={onClose}>
      <UnderlinedHeader title="ADD QUANTITY" />
      <div className="space-y-4 mb-6" onMouseDown={(e) => e.stopPropagation()}>
        <Typography variant="13" className="text-black">Amount to Add (in meters):</Typography>
        <input
          type="number"
          step="0.01"
          min="0.01"
          className="border border-black p-2 rounded w-full"
          value={amountToAdd ?? ''}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setAmountToAdd(isNaN(val) ? 0 : val);
          }}
          disabled={loading}
        />
        {error && <Typography variant="13" className="text-red-600">{error}</Typography>}
      </div>
      <ActionButtonsRow>
        <StyledLink onClick={loading ? () => {} : handleSubmit} className="text-black">
          <Typography variant="15" className="text-black">{loading ? 'Saving...' : 'SAVE'}</Typography>
        </StyledLink>
        <StyledLink onClick={loading ? () => {} : onClose} className="text-black">
          <Typography variant="15" className="text-black">CANCEL</Typography>
        </StyledLink>
      </ActionButtonsRow>
    </BlurryOverlayPanel>
  );
}