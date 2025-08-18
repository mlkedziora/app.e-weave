// frontend/src/components/inventory/DeleteCategoryConfirm.tsx
import React from 'react';
import BlurryOverlayPanel from '../common/BlurryOverlayPanel';
import Typography from '../common/Typography';
import StyledLink from '../common/StyledLink';
import ActionButtonsRow from '../common/ActionButtonsRow';

interface DeleteCategoryConfirmProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteCategoryConfirm({ onClose, onConfirm }: DeleteCategoryConfirmProps) {
  return (
    <BlurryOverlayPanel onClose={onClose}>
      <div className="p-8 max-w-sm mx-auto">
        <Typography variant="15" className="text-black mb-6 text-center">Are you sure you want to delete this category? Materials will be moved to Uncategorized.</Typography>
        <ActionButtonsRow>
          <StyledLink onClick={onConfirm} className="text-black">
            <Typography variant="15" className="text-black">YES</Typography>
          </StyledLink>
          <StyledLink onClick={onClose} className="text-black">
            <Typography variant="15" className="text-black">NO</Typography>
          </StyledLink>
        </ActionButtonsRow>
      </div>
    </BlurryOverlayPanel>
  );
}