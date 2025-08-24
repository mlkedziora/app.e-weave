// frontend/src/components/inventory/ProjectHistoryOverlay.tsx
import React from 'react';
import Typography from '../common/Typography';
import StyledLink from '../common/StyledLink';
import UnderlinedHeader from '../common/UnderlinedHeader';
import ActionButtonsRow from '../common/ActionButtonsRow';
import BlurryOverlayPanel from '../common/BlurryOverlayPanel';

interface ProjectHistoryOverlayProps {
  projectHistory: {
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
  onSelectProject: (project: any) => void;
  onAddProject: () => void;
}

export default function ProjectHistoryOverlay({ projectHistory, onClose, onSelectProject, onAddProject }: ProjectHistoryOverlayProps) {
  const sortedHistory = [
    ...projectHistory.filter(t => !t.completedAt).sort((a, b) => {
      const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return da - db;
    }),
    ...projectHistory.filter(t => t.completedAt).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
  ];

  const half = Math.ceil(sortedHistory.length / 2);
  const leftProjects = sortedHistory.slice(0, half);
  const rightProjects = sortedHistory.slice(half);

  return (
    <BlurryOverlayPanel draggable={true} onClose={onClose}>
      <UnderlinedHeader title="PROJECT HISTORY" />
      {sortedHistory.length > 0 ? (
        <div className="flex gap-4 mb-6">
          <div className="flex flex-col space-y-4 flex-1">
            {leftProjects.map((histProject) => (
              <div 
                key={histProject.id} 
                className="flex items-center cursor-pointer"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => onSelectProject(histProject)}
              >
                <div className="w-4 h-4 border border-black rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  {histProject.completedAt && <div className="w-2 h-2 bg-[#D7FAEA] rounded-full"></div>}
                </div>
                <div>
                  <Typography variant="15" className="text-black">{histProject.name}</Typography>
                  <Typography variant="13" className="text-black">Progress: {histProject.progress}%</Typography>
                  <Typography variant="13" className="text-black">
                    Deadline: {histProject.deadline ? new Date(histProject.deadline).toLocaleDateString() : 'None'}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col space-y-4 flex-1">
            {rightProjects.map((histProject) => (
              <div 
                key={histProject.id} 
                className="flex items-center cursor-pointer"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => onSelectProject(histProject)}
              >
                <div className="w-4 h-4 border border-black rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  {histProject.completedAt && <div className="w-2 h-2 bg-[#D7FAEA] rounded-full"></div>}
                </div>
                <div>
                  <Typography variant="15" className="text-black">{histProject.name}</Typography>
                  <Typography variant="13" className="text-black">Progress: {histProject.progress}%</Typography>
                  <Typography variant="13" className="text-black">
                    Deadline: {histProject.deadline ? new Date(histProject.deadline).toLocaleDateString() : 'None'}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Typography variant="13" className="text-black italic mb-6">No project history yet.</Typography>
      )}
      <ActionButtonsRow>
        <StyledLink onClick={onAddProject} className="text-black">
          <Typography variant="15" className="text-black">ADD PROJECT</Typography>
        </StyledLink>
        <StyledLink onClick={onClose} className="text-black">
          <Typography variant="15" className="text-black">QUIT</Typography>
        </StyledLink>
      </ActionButtonsRow>
    </BlurryOverlayPanel>
  );
}