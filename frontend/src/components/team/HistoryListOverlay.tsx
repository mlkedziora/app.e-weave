// frontend/src/components/team/HistoryListOverlay.tsx
import React from 'react';
import Typography from '../common/Typography';
import StyledLink from '../common/StyledLink';
import UnderlinedHeader from '../common/UnderlinedHeader';
import ActionButtonsRow from '../common/ActionButtonsRow';
import BlurryOverlayPanel from '../common/BlurryOverlayPanel';

interface HistoryListOverlayProps {
  taskHistory: {
    id: string;
    name: string;
    progress: number;
    deadline?: string | null;
    startDate?: string | null;
    completedAt?: string | null;
    subtasks?: { id: string; name: string; completed: boolean; completedAt?: string | null }[];
    materials?: { name: string; amountUsed: number; usedAt: string }[];
  }[];
  onClose: () => void;
  onSelectTask: (task: any) => void;
}

export default function HistoryListOverlay({ taskHistory, onClose, onSelectTask }: HistoryListOverlayProps) {
  const sortedHistory = [
    ...taskHistory.filter(t => !t.completedAt).sort((a, b) => {
      const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return da - db;
    }),
    ...taskHistory.filter(t => t.completedAt).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
  ];

  const half = Math.ceil(sortedHistory.length / 2);
  const leftTasks = sortedHistory.slice(0, half);
  const rightTasks = sortedHistory.slice(half);

  return (
    <BlurryOverlayPanel onClose={onClose}>
      <UnderlinedHeader title="TASK HISTORY" />
      {sortedHistory.length > 0 ? (
        <div className="flex gap-4 mb-6">
          <div className="flex flex-col space-y-4 flex-1">
            {leftTasks.map((histTask) => (
              <div 
                key={histTask.id} 
                className="flex items-center cursor-pointer"
                onClick={() => onSelectTask(histTask)}
              >
                <div className="w-4 h-4 border border-black rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  {histTask.completedAt && <div className="w-2 h-2 bg-[#D7FAEA] rounded-full"></div>}
                </div>
                <div>
                  <Typography variant="15" className="text-black">{histTask.name}</Typography>
                  <Typography variant="13" className="text-black">Progress: {histTask.progress}%</Typography>
                  <Typography variant="13" className="text-black">
                    Deadline: {histTask.deadline ? new Date(histTask.deadline).toLocaleDateString() : 'None'}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col space-y-4 flex-1">
            {rightTasks.map((histTask) => (
              <div 
                key={histTask.id} 
                className="flex items-center cursor-pointer"
                onClick={() => onSelectTask(histTask)}
              >
                <div className="w-4 h-4 border border-black rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  {histTask.completedAt && <div className="w-2 h-2 bg-[#D7FAEA] rounded-full"></div>}
                </div>
                <div>
                  <Typography variant="15" className="text-black">{histTask.name}</Typography>
                  <Typography variant="13" className="text-black">Progress: {histTask.progress}%</Typography>
                  <Typography variant="13" className="text-black">
                    Deadline: {histTask.deadline ? new Date(histTask.deadline).toLocaleDateString() : 'None'}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Typography variant="13" className="text-black italic mb-6">No task history yet.</Typography>
      )}
      <ActionButtonsRow>
        <StyledLink onClick={() => {}} className="text-black">
          <Typography variant="15" className="text-black">ASSIGN TASK</Typography>
        </StyledLink>
        <StyledLink onClick={onClose} className="text-black">
          <Typography variant="15" className="text-black">QUIT</Typography>
        </StyledLink>
      </ActionButtonsRow>
    </BlurryOverlayPanel>
  );
}