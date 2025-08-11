// frontend/src/components/team/HistoryTaskDetail.tsx
import React, { useState } from 'react';
import ScrollablePanel from '../common/ScrollablePanel';
import Typography from '../common/Typography';
import StyledLink from '../common/StyledLink';
import ProgressDisplay from '../common/ProgressDisplay';
import UnderlinedHeader from '../common/UnderlinedHeader';
import SubtaskItem from '../common/SubtaskItem';
import ActionButtonsRow from '../common/ActionButtonsRow';
import ListContainer from '../common/ListContainer';
import TwoColumnSubtasks from '../common/TwoColumnSubtasks';
import BlurryOverlayPanel from '../common/BlurryOverlayPanel';
import { useAuth } from '@clerk/clerk-react';

interface HistoryTaskDetailProps {
  task: {
    id: string;
    name: string;
    subtasks?: { id: string; name: string; completed: boolean; completedAt?: string | null }[];
    progress: number;
    deadline?: string | null;
    startDate?: string | null;
    materials?: { name: string; amountUsed: number; usedAt: string }[];
    completedAt?: string | null;
  };
  onClose: () => void;
}

export default function HistoryTaskDetail({ task: initialTask, onClose }: HistoryTaskDetailProps) {
  const [showAllSubtasks, setShowAllSubtasks] = useState(false);
  const [showAddSubtaskForm, setShowAddSubtaskForm] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [subtaskError, setSubtaskError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const [task, setTask] = useState(initialTask);

  const calculatedProgress = task.subtasks?.length > 0
    ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
    : 0;

  const handleAddSubtask = async () => {
    if (!newSubtaskName.trim()) {
      setSubtaskError('Enter a subtask description.');
      return;
    }
    setSubtaskError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/subtasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId: task.id,
          name: newSubtaskName,
        }),
      });
      if (res.ok) {
        const newSub = await res.json();
        setTask({
          ...task,
          subtasks: [...(task.subtasks || []), { id: newSub.id, name: newSubtaskName, completed: false, completedAt: null }],
        });
        setNewSubtaskName('');
        setShowAddSubtaskForm(false);
      } else {
        const errorBody = await res.json();
        setSubtaskError(`Failed to add subtask: ${errorBody.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error adding subtask:', err);
      setSubtaskError('Error adding subtask, possibly due to network issues.');
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!confirm('Are you sure you want to delete this subtask?')) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setTask({
          ...task,
          subtasks: task.subtasks?.filter(s => s.id !== subtaskId) || [],
        });
      } else {
        alert('Failed to delete subtask.');
      }
    } catch (err) {
      console.error('Error deleting subtask:', err);
      alert('Error deleting subtask.');
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    const subtask = task.subtasks?.find(s => s.id === subtaskId);
    if (!subtask) return;

    const newCompleted = !subtask.completed;
    const newCompletedAt = newCompleted ? new Date().toISOString() : null;

    const updatedSubtasks = task.subtasks?.map(s => 
      s.id === subtaskId ? { ...s, completed: newCompleted, completedAt: newCompletedAt } : s
    ) || [];
    const updatedTask = { ...task, subtasks: updatedSubtasks, progress: Math.round((updatedSubtasks.filter(s => s.completed).length / updatedSubtasks.length) * 100) };

    setTask(updatedTask);

    try {
      const token = await getToken();
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: newCompleted }),
      });
      if (!res.ok) {
        throw new Error('Failed to update subtask');
      }

      // SPA logic for auto-complete (but since this is history detail, perhaps no promotion needed here)
      const allCompleted = updatedSubtasks.every(s => s.completed);
      if (allCompleted) {
        setTask({ ...updatedTask, completedAt: new Date().toISOString() });
      }
    } catch (err) {
      console.error('Error updating subtask:', err);
      // Revert
      setTask({ ...task, subtasks: task.subtasks });
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        onClose();
      } else {
        alert('Failed to delete task.');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Error deleting task.');
    }
  };

  const sortedPendingSubtasks = [...(task.subtasks?.filter(s => !s.completed) || [])].reverse();

  const sortedCompletedSubtasks = [...(task.subtasks?.filter(s => s.completed) || [])].sort((a, b) => {
    const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return timeB - timeA; // Newest first
  });

  const displayedSubtasks = [...sortedPendingSubtasks, ...sortedCompletedSubtasks].slice(0, 10);

  return (
    <BlurryOverlayPanel>
      <UnderlinedHeader title={task.name.toUpperCase()} />
      <div className="flex justify-between mb-6">
        <Typography variant="15" className="text-black">Task: {task.name}</Typography>
        <Typography variant="15" className="text-black">
          Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
        </Typography>
      </div>
      {task.subtasks?.length > 0 ? (
        <TwoColumnSubtasks
          subtasks={displayedSubtasks}
          onToggle={handleToggleSubtask}
          className="mb-6"
        />
      ) : (
        <Typography variant="13" className="text-black italic mb-6">No subtasks available.</Typography>
      )}
      <ProgressDisplay progress={calculatedProgress} className="mb-6" />
      {showAllSubtasks && (
        <div>
          <UnderlinedHeader title="TASK DETAILS" />
          <div className="space-y-2 mb-6">
            <Typography variant="15" className="text-black">
              Start Date: {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'}
            </Typography>
            <Typography variant="15" className="text-black">
              Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
            </Typography>
          </div>
          <UnderlinedHeader title="MATERIALS USED" />
          <ListContainer
            className="mb-6"
            items={
              task.materials?.map((m, i) => (
                <div key={i} className="border p-4 rounded bg-gray-50 space-y-2">
                  <Typography variant="15" className="text-black">Material: {m.name}</Typography>
                  <Typography variant="15" className="text-black">Amount Used: {m.amountUsed} m</Typography>
                  <Typography variant="15" className="text-black">Used At: {new Date(m.usedAt).toLocaleString()}</Typography>
                </div>
              )) || []
            }
            emptyMessage="No materials used."
          />
          <UnderlinedHeader title="SUBTASKS" />
          <ListContainer
            className="mb-6"
            items={[...sortedPendingSubtasks, ...sortedCompletedSubtasks].map((sub) => (
              <SubtaskItem
                key={sub.id}
                id={sub.id}
                name={sub.name}
                completed={sub.completed}
                showDelete={true}
                onDelete={handleDeleteSubtask}
                showStatus={true}
                onToggle={handleToggleSubtask}
              />
            ))}
            emptyMessage="No subtasks."
          />
          <StyledLink onClick={handleDeleteTask} className="text-red-500 block mt-4">
            Delete Task
          </StyledLink>
        </div>
      )}
      <ActionButtonsRow>
        <StyledLink onClick={() => setShowAddSubtaskForm(true)} className="text-black">
          <Typography variant="15" className="text-black">ADD SUBTASK</Typography>
        </StyledLink>
        <StyledLink onClick={() => setShowAllSubtasks(!showAllSubtasks)} className="text-black">
          <Typography variant="15" className="text-black">
            {showAllSubtasks ? 'HIDE SUBTASKS' : 'EXPAND SUBTASKS'}
          </Typography>
        </StyledLink>
      </ActionButtonsRow>
      {showAddSubtaskForm && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <Typography variant="15" className="text-black mb-2">Add Subtask</Typography>
          <input
            type="text"
            value={newSubtaskName}
            onChange={(e) => setNewSubtaskName(e.target.value)}
            placeholder="Subtask description"
            className="border p-2 w-full mb-2"
          />
          {subtaskError && <Typography variant="13" className="text-red-500 mb-2">{subtaskError}</Typography>}
          <div className="flex gap-2">
            <button className="bg-black text-white px-4 py-2 rounded" onClick={handleAddSubtask}>
              Add
            </button>
            <button
              className="bg-gray-200 px-4 py-2 rounded"
              onClick={() => setShowAddSubtaskForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="flex justify-center mt-6">
        <StyledLink onClick={onClose} className="text-black">
          <Typography variant="15" className="text-black">QUIT</Typography>
        </StyledLink>
      </div>
    </BlurryOverlayPanel>
  );
}