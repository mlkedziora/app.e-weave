// frontend/src/components/common/ListContainer.tsx
import React, { FC, ReactNode } from 'react';
import Typography from './Typography';

interface ListContainerProps {
  items: ReactNode[];
  emptyMessage?: string;
  className?: string;
}

const ListContainer: FC<ListContainerProps> = ({ items, emptyMessage = 'No items.', className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {items.length > 0 ? items : <Typography variant="13" className="text-black italic">{emptyMessage}</Typography>}
    </div>
  );
};

export default ListContainer;