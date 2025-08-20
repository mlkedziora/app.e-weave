// frontend/src/components/common/BlurryOverlayPanel.tsx
import React, { ReactNode, CSSProperties } from 'react';

interface BlurryOverlayPanelProps {
  children: ReactNode;
  onClose: () => void;
  innerStyle?: CSSProperties; // Optional prop to customize the inner panel's style
  innerClassName?: string; // Optional prop to add custom classes to the inner panel
}

export default function BlurryOverlayPanel({ children, onClose, innerStyle = {}, innerClassName = '' }: BlurryOverlayPanelProps) {
  // The default position is preserved here: centered horizontally (via flex justify-center on the outer div)
  // and with a top margin of 65px on the inner div (via mt-[65px] class).
  // When you call <BlurryOverlayPanel ... /> without innerStyle, it uses this default placement.
  // To modify the position for specific instances (e.g., make it lower or shifted left), pass an innerStyle object
  // with overrides like { marginTop: '100px', marginLeft: '-10%' }.
  // Note: marginLeft negative values shift it left from the center. You can use percentages or pixels.
  // If you need more advanced positioning, consider using transform: 'translate(-10%, 20%)' for relative shifts.
  
  return (
    <div className="absolute inset-0 backdrop-blur-[3px] flex items-start justify-center z-50" style={{ backgroundColor: 'transparent' }} onClick={onClose}>
      <div 
        className={`bg-white p-6 rounded-lg shadow-md overflow-y-auto w-11/12 max-w-4xl max-h-[80vh] mt-[65px] ${innerClassName}`}
        style={innerStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}