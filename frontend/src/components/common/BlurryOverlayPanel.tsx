// frontend/src/components/common/BlurryOverlayPanel.tsx
import React, { ReactNode } from 'react';

interface BlurryOverlayPanelProps {
  children: ReactNode;
  onClose: () => void;
}

export default function BlurryOverlayPanel({ children, onClose }: BlurryOverlayPanelProps) {
  return (
    <div className="absolute inset-0 backdrop-blur-[3px] flex items-start justify-center z-50" style={{ backgroundColor: 'transparent' }} onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-md overflow-y-auto w-11/12 max-w-4xl max-h-[80vh] mt-[65px]" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}