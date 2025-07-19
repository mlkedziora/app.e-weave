// frontend/src/components/common/FullPageCard.tsx
import React, { ReactNode } from 'react';

interface FullPageCardProps {
  children: ReactNode;
  className?: string; // Optional extra classes (e.g., for custom padding or spacing)
  noPadding?: boolean; // Option to remove default padding for edge-to-edge content
  noShadow?: boolean; // Option to remove shadow if not needed
}

export default function FullPageCard({
  children,
  className = '',
  noPadding = false,
  noShadow = false,
}: FullPageCardProps) {
  return (
    <div
      className={`w-full h-full flex-1 bg-white overflow-y-auto ${
        noPadding ? 'p-0' : 'p-6'
      } ${noShadow ? '' : 'rounded-lg shadow-md'} text-black ${className}`}
    >
      {children}
    </div>
  );
}