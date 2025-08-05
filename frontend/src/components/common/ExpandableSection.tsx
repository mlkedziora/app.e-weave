// frontend/src/components/common/ExpandableSection.tsx
import React, { FC, ReactNode } from 'react';

interface ExpandableSectionProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

const ExpandableSection: FC<ExpandableSectionProps> = ({ isOpen, children, className = '' }) => {
  if (!isOpen) return null;
  return <div className={`mt-4 space-y-4 ${className}`}>{children}</div>;
};

export default ExpandableSection;