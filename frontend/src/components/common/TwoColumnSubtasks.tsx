// frontend/src/components/common/TwoColumnSubtasks.tsx
import React, { FC } from 'react';
import SubtaskItem from './SubtaskItem';

interface TwoColumnSubtasksProps {
  subtasks: { id: string; name: string; completed: boolean; completedAt?: string | null }[];
  onToggle: (id: string) => void;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
  showStatus?: boolean;
  className?: string;
}

const TwoColumnSubtasks: FC<TwoColumnSubtasksProps> = ({
  subtasks,
  onToggle,
  showDelete = false,
  onDelete,
  showStatus = false,
  className = '',
}) => {
  const half = Math.ceil(subtasks.length / 2);
  const left = subtasks.slice(0, half);
  const right = subtasks.slice(half);

  return (
    <div className={`flex gap-4 ${className}`}>
      <div className="flex flex-col space-y-4 flex-1">
        {left.map((sub) => (
          <SubtaskItem
            key={sub.id}
            id={sub.id}
            name={sub.name}
            completed={sub.completed}
            showDelete={showDelete}
            onDelete={onDelete}
            showStatus={showStatus}
            onToggle={onToggle}
          />
        ))}
      </div>
      <div className="flex flex-col space-y-4 flex-1">
        {right.map((sub) => (
          <SubtaskItem
            key={sub.id}
            id={sub.id}
            name={sub.name}
            completed={sub.completed}
            showDelete={showDelete}
            onDelete={onDelete}
            showStatus={showStatus}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default TwoColumnSubtasks;