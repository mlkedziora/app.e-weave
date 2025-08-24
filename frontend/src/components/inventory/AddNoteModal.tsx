import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Typography from '../common/Typography';
import UnderlinedHeader from '../common/UnderlinedHeader';
import ActionButtonsRow from '../common/ActionButtonsRow';
import BlurryOverlayPanel from '../common/BlurryOverlayPanel';
import StyledLink from '../common/StyledLink';
import SmartInput from '../common/SmartInput';

type AddNoteModalProps = {
  materialId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddNoteModal({ materialId, onClose, onSuccess }: AddNoteModalProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Please enter a note.');
      return;
    }

    setLoading(true);
    setError(null);

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
        throw new Error(errorBody.message || 'Failed to add note');
      } else {
        console.log('[AddNote] Success');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error('Error adding note:', err);
      setError(err.message || 'Error adding note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlurryOverlayPanel draggable={true} onClose={onClose}>
      <UnderlinedHeader title="ADD NOTE" />
      <div className="space-y-4 mb-6" onMouseDown={(e) => e.stopPropagation()}>
        <SmartInput
          as="textarea"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note..."
          className="w-full bg-white border border-black p-2"
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