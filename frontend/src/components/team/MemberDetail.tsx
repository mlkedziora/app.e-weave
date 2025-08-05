// frontend/src/components/team/MemberDetail.tsx
import React, { useState } from 'react';
import ScrollablePanel from '../common/ScrollablePanel';
import EmptyPanel from '../common/EmptyPanel';
import Typography from '../common/Typography';
import StyledLink from '../common/StyledLink';
import ProgressDisplay from '../common/ProgressDisplay';
import UnderlinedHeader from '../common/UnderlinedHeader';
import SubtaskItem from '../common/SubtaskItem';
import { useAuth } from '@clerk/clerk-react';

interface MemberDetailProps {
  member: {
    name: string;
    position?: string;
    startDate: string;
    endDate: string;
    currentTask?: {
      id: string;
      name: string;
      subtasks?: { id: string; name: string; completed: boolean; completedAt?: string | null }[];
      progress: number;
      deadline?: string | null;
      startDate?: string | null;
      materials?: { name: string; amountUsed: number; usedAt: string }[];
    };
    completedTasks?: { name: string; subtasks?: { name: string }[] }[];
  };
}

export default function MemberDetail({ member }: MemberDetailProps) {
  const [showAllSubtasks, setShowAllSubtasks] = useState(false);
  const [showAddSubtaskForm, setShowAddSubtaskForm] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [subtaskError, setSubtaskError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const [currentTask, setCurrentTask] = useState(member.currentTask);

  if (!member) {
    return <EmptyPanel>Select a member to view performance.</EmptyPanel>;
  }

  let task = currentTask;
  if (!task) {
    task = { id: '', name: '', subtasks: [], progress: 0 };
  }

  const start = new Date(member.startDate).toLocaleDateString();
  const end = new Date(member.endDate).toLocaleDateString();

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
        setCurrentTask({
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
        setCurrentTask({
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
    setCurrentTask({ ...task, subtasks: updatedSubtasks });

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
    } catch (err) {
      console.error('Error updating subtask:', err);
      // Revert local state on error
      const revertedSubtasks = task.subtasks?.map(s => 
        s.id === subtaskId ? { ...s, completed: subtask.completed, completedAt: subtask.completedAt } : s
      ) || [];
      setCurrentTask({ ...task, subtasks: revertedSubtasks });
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
        setCurrentTask(null);
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
    <ScrollablePanel className="space-y-12">
      {/* PROFILE HEADER */}
      <div>
        <Typography variant="20" weight="light" element="h2" className="tracking-[3px] mb-4 text-black">
          INDIVIDUAL PERFORMANCE
        </Typography>
        <div className="flex gap-8">
          <img
            src="/profile-icon.jpg"
            alt="Profile"
            className="w-48 h-48 object-cover rounded"
          />
          <div className="space-y-4">
            <Typography variant="15" className="text-black">Name: {member.name}</Typography>
            <Typography variant="15" className="text-black">Position: {member.position ?? '—'}</Typography>
            <Typography variant="15" className="text-black">Start: {start}</Typography>
            <Typography variant="15" className="text-black">End: {end}</Typography>
          </div>
        </div>
      </div>

      {/* CURRENT TASK */}
      <div>
        <UnderlinedHeader title="CURRENT TASK" />
        {task ? (
          <>
            <div className="flex justify-between mb-6">
              <Typography variant="15" className="text-black">Task: {task.name}</Typography>
              <Typography variant="15" className="text-black">
                Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
              </Typography>
            </div>
            {task.subtasks?.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {displayedSubtasks.map((subtask) => (
                  <SubtaskItem
                    key={subtask.id}
                    id={subtask.id}
                    name={subtask.name}
                    completed={subtask.completed}
                    showDelete={false}
                    onDelete={handleDeleteSubtask}
                    onToggle={handleToggleSubtask}
                  />
                ))}
              </div>
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
                <div className="space-y-4 mb-6">
                  {task.materials?.length > 0 ? (
                    task.materials.map((m, i) => (
                      <div key={i} className="border p-4 rounded bg-gray-50 space-y-2">
                        <Typography variant="15" className="text-black">Material: {m.name}</Typography>
                        <Typography variant="15" className="text-black">Amount Used: {m.amountUsed} m</Typography>
                        <Typography variant="15" className="text-black">Used At: {new Date(m.usedAt).toLocaleString()}</Typography>
                      </div>
                    ))
                  ) : (
                    <Typography variant="13" className="text-black italic">No materials used.</Typography>
                  )}
                </div>
                <UnderlinedHeader title="SUBTASKS" />
                <div className="space-y-4 mb-6">
                  {task.subtasks?.length > 0 ? (
                    [...sortedPendingSubtasks, ...sortedCompletedSubtasks].map((sub) => (
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
                    ))
                  ) : (
                    <Typography variant="13" className="text-black italic">No subtasks.</Typography>
                  )}
                </div>
                <StyledLink onClick={handleDeleteTask} className="text-red-500 block mt-4">
                  Delete Task
                </StyledLink>
              </div>
            )}
            <div className="flex justify-between mt-6">
              <StyledLink onClick={() => setShowAddSubtaskForm(true)} className="text-black">
                <Typography variant="15" className="text-black">ADD SUBTASK</Typography>
              </StyledLink>
              <StyledLink onClick={() => setShowAllSubtasks(!showAllSubtasks)} className="text-black">
                <Typography variant="15" className="text-black">
                  {showAllSubtasks ? 'HIDE SUBTASKS' : 'EXPAND SUBTASKS'}
                </Typography>
              </StyledLink>
            </div>
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
          </>
        ) : (
          <Typography variant="13" className="text-black italic">No current tasks have been assigned.</Typography>
        )}
      </div>

      {/* TASK HISTORY */}
      <div>
        <Typography variant="20" weight="light" element="h2" className="tracking-[3px] mb-4 text-black">
          TASK HISTORY
        </Typography>
        <div className="space-y-4">
          {member.completedTasks?.length > 0 ? (
            member.completedTasks.slice(0, 10).map((task, i) => (
              <div key={i} className="border p-4 rounded bg-gray-50 space-y-2">
                <Typography variant="15" className="text-black">{task.name}</Typography>
                {task.subtasks?.length ? (
                  task.subtasks.map((sub, j) => (
                    <Typography key={j} variant="13" className="text-black italic">{sub.name}</Typography>
                  ))
                ) : (
                  <Typography variant="13" className="text-black italic">No subtasks</Typography>
                )}
              </div>
            ))
          ) : (
            <Typography variant="13" className="text-black italic">No task history yet.</Typography>
          )}
        </div>
        <StyledLink onClick={() => {}} className="mt-4 text-black block">
          Expand History
        </StyledLink>
      </div>

      {/* ACTIONS */}
      <div>
        <Typography variant="20" weight="light" element="h2" className="tracking-[3px] mb-4 text-black">
          ACTIONS
        </Typography>
        <div className="flex gap-4">
          <StyledLink onClick={() => {}} className="text-black block">Assign Task</StyledLink>
        </div>
      </div>

      {/* PERFORMANCE CHART */}
      <div>
        <Typography variant="20" weight="light" element="h2" className="tracking-[3px] mb-4 text-black">
          PERFORMANCE CHART
        </Typography>
        <Typography variant="13" className="text-black mb-4">Tailored to Contract Length</Typography>
        <img
          src="/performance-chart.png"
          alt="Performance Chart"
          className="w-full max-w-md rounded"
        />
      </div>

      {/* GROWTH FORECAST */}
      <div>
        <Typography variant="20" weight="light" element="h2" className="tracking-[3px] mb-4 text-black">
          GROWTH FORECAST
        </Typography>
        <Typography variant="13" className="text-black mb-4">Based on Previous Performance</Typography>
        <img
          src="/growth-forecast.png"
          alt="Growth Forecast"
          className="w-full max-w-md rounded"
        />
      </div>
    </ScrollablePanel>
  );
}