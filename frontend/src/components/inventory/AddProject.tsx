// frontend/src/components/inventory/AddProject.tsx
import React, { useState, useEffect } from 'react';
import Typography from '../common/Typography';
import StyledLink from '../common/StyledLink';
import UnderlinedHeader from '../common/UnderlinedHeader';
import BlurryOverlayPanel from '../common/BlurryOverlayPanel';
import { useAuth } from '@clerk/clerk-react';
import SmartInput from '../common/SmartInput';
import ListContainer from '../common/ListContainer';
import SubtaskItem from '../common/SubtaskItem';

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  name: string;
}

interface AddProjectProps {
  material: {
    id: string;
    name: string;
  };
  onClose: () => void;
  onAdded: () => void;
}

export default function AddProject({ material, onClose, onAdded }: AddProjectProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const customInnerStyle = {
    marginTop: '0px',
    marginLeft: '0',
    overflow: 'visible',
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        } else {
          setError('Failed to load projects.');
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Error loading projects.');
      }
    };
    fetchProjects();
  }, [getToken]);

  useEffect(() => {
    if (selectedProjectId) {
      const fetchTasks = async () => {
        try {
          const token = await getToken();
          const res = await fetch(`/api/projects/${selectedProjectId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setTasks(data.tasks || []);
          } else {
            setError('Failed to load tasks.');
          }
        } catch (err) {
          console.error('Error fetching tasks:', err);
          setError('Error loading tasks.');
        }
      };
      fetchTasks();
    }
  }, [selectedProjectId, getToken]);

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleAssign = async () => {
    if (!selectedProjectId) {
      setError('Please select a project.');
      return;
    }
    try {
      const token = await getToken();
      const res = await fetch(`/api/materials/${material.id}/assign-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: selectedProjectId,
          taskIds: Array.from(selectedTaskIds),
        }),
      });
      if (res.ok) {
        onAdded();
        onClose();
      } else {
        const errorBody = await res.json();
        setError('Failed to assign project: ' + (errorBody.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error assigning project:', err);
      setError('Error assigning project.');
    }
  };

  return (
    <BlurryOverlayPanel draggable={true} innerStyle={customInnerStyle} onClose={onClose}>
      <UnderlinedHeader title={`ADD PROJECT TO ${material.name.toUpperCase()}`} />
      <div className="mb-10"> {/* Increased from mb-6 to mb-12 for more space */}
        <Typography variant="15" className="text-black mb-2">Select Project:</Typography>
        <SmartInput
          as="select"
          value={selectedProjectId || ''}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full uppercase text-left"
        >
          <option value="">CHOOSE A PROJECT...</option>
          {projects.map((proj) => (
            <option key={proj.id} value={proj.id}>
              {proj.name.toUpperCase()}
            </option>
          ))}
        </SmartInput>
      </div>

      {selectedProjectId && (
        <>
          <UnderlinedHeader title="CORRELATED TASKS (OPTIONAL)" />
          <ListContainer
            className="mb-6 max-h-60 overflow-y-auto"
            items={tasks.map((t) => (
              <SubtaskItem
                key={t.id}
                id={t.id}
                name={t.name}
                completed={selectedTaskIds.has(t.id)}
                showDelete={false}
                showStatus={false}
                onToggle={() => toggleTaskSelection(t.id)}
              />
            ))}
            emptyMessage="No tasks available."
          />
          <div className="flex justify-between">
            <StyledLink onClick={onClose} className="text-black">
              <Typography variant="15" className="text-black">CANCEL</Typography>
            </StyledLink>
            <StyledLink onClick={handleAssign} className="text-black">
              <Typography variant="15" className="text-black">ASSIGN</Typography>
            </StyledLink>
          </div>
        </>
      )}

      {error && <Typography variant="13" className="text-red-500 mt-4">{error}</Typography>}
    </BlurryOverlayPanel>
  );
}