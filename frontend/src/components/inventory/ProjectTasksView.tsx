// frontend/src/components/inventory/ProjectTasksView.tsx
import React, { useState, useEffect } from 'react';
import BlurryOverlayPanel from '../common/BlurryOverlayPanel';
import UnderlinedHeader from '../common/UnderlinedHeader';
import StyledLink from '../common/StyledLink';
import Typography from '../common/Typography';
import { useAuth } from '@clerk/clerk-react';

interface ProjectTasksViewProps {
  project: any;
  onClose: () => void;
}

export default function ProjectTasksView({ project, onClose }: ProjectTasksViewProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchProjectTasks = async () => {
      try {
        const token = await getToken({ template: 'backend-access' });
        const res = await fetch(`/api/projects/${project.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTasks(data.tasks || []);
        }
      } catch (err) {
        console.error('Failed to fetch project tasks:', err);
      }
    };
    fetchProjectTasks();
  }, [project.id, getToken]);

  const tablePadding = 'p-2.5';

  return (
    <BlurryOverlayPanel draggable={true} onClose={onClose}>
      <UnderlinedHeader title={project.name.toUpperCase()} />
      <div className="border border-black rounded-lg overflow-hidden mb-6" onMouseDown={(e) => e.stopPropagation()}>
        {tasks.length > 0 ? (
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr>
                <th className={`${tablePadding} text-center border-b border-r last:border-r-0 text-black font-normal`}>TASK(S)</th>
                <th className={`${tablePadding} text-center border-b border-r last:border-r-0 text-black font-normal`}>MEMBER(S)</th>
                <th className={`${tablePadding} text-center border-b border-r last:border-r-0 text-black font-normal`}>START</th>
                <th className={`${tablePadding} text-center border-b border-r last:border-r-0 text-black font-normal`}>DEADLINE</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task: any) => (
                <tr key={task.id}>
                  <td className={`${tablePadding} text-center border-t border-r last:border-r-0 text-black font-normal`}>{task.name}</td>
                  <td className={`${tablePadding} text-center border-t border-r last:border-r-0 text-black font-normal`}>{task.assignees?.map((a: any) => a.teamMember.name).join(', ') || 'Unassigned'}</td>
                  <td className={`${tablePadding} text-center border-t border-r last:border-r-0 text-black font-normal`}>{task.startedAt ? new Date(task.startedAt).toLocaleDateString() : 'N/A'}</td>
                  <td className={`${tablePadding} text-center border-t border-r last:border-r-0 text-black font-normal`}>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={`${tablePadding} bg-white text-center`}>
            <Typography variant="13" className="text-black italic">No tasks available.</Typography>
          </div>
        )}
      </div>
      <div className="flex justify-center mt-6" onMouseDown={(e) => e.stopPropagation()}>
        <StyledLink onClick={onClose} className="text-black">
          <Typography variant="15" className="text-black">QUIT</Typography>
        </StyledLink>
      </div>
    </BlurryOverlayPanel>
  );
}