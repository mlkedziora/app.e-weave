// frontend/src/components/inventory/AddMaterialPanel.tsx
import React from 'react';
import BlurryOverlayPanel from '../common/BlurryOverlayPanel';
import UnderlinedHeader from '../common/UnderlinedHeader';
import MaterialForm from '../add-new/MaterialForm';

interface AddMaterialPanelProps {
  onClose: () => void;
  onAdded: (newMaterial: Material) => void;
}

export default function AddMaterialPanel({ onClose, onAdded }: AddMaterialPanelProps) {
  return (
    <BlurryOverlayPanel onClose={onClose}>
      <UnderlinedHeader title="ADD NEW MATERIAL" />
      <MaterialForm onSuccess={(newMaterial) => onAdded(newMaterial)} onCancel={onClose} />
    </BlurryOverlayPanel>
  );
}