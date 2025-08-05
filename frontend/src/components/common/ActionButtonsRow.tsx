// frontend/src/components/common/ActionButtonsRow.tsx
import React, { FC, ReactNode } from 'react';

interface ActionButtonsRowProps {
  children: ReactNode;
  className?: string;
}

const ActionButtonsRow: FC<ActionButtonsRowProps> = ({ children, className = '' }) => {
  return <div className={`flex justify-between mt-6 ${className}`}>{children}</div>;
};

export default ActionButtonsRow;