// frontend/src/components/common/SubtaskItem.tsx
import React, { FC } from 'react';
import Typography from './Typography';

interface SubtaskItemProps {
  id: string;
  name: string;
  completed: boolean;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
  showStatus?: boolean;
  onToggle?: (id: string) => void;
}

const SubtaskItem: FC<SubtaskItemProps> = ({ id, name, completed, showDelete = false, onDelete, showStatus = false, onToggle }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div
          className="w-4 h-4 border border-black rounded-full flex items-center justify-center mr-2 flex-shrink-0 cursor-pointer"
          onClick={() => onToggle?.(id)}
        >
          {completed && (
            <div className="w-2 h-2 bg-[#D7FAEA] rounded-full"></div>
          )}
        </div>
        <Typography variant="13" className="text-black">
          {name} {showStatus ? (completed ? '(Completed)' : '(Pending)') : ''}
        </Typography>
      </div>
      {showDelete && onDelete && (
        <button
          className="text-red-500 ml-2"
          onClick={() => onDelete(id)}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SubtaskItem;