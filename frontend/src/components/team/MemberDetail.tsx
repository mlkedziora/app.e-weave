// frontend/src/components/team/MemberDetail.tsx
import React, { useState, useEffect } from 'react';
import ScrollablePanel from '../common/ScrollablePanel';
import EmptyPanel from '../common/EmptyPanel';
import Typography from '../common/Typography';
import StyledLink from '../common/StyledLink';
import ProgressDisplay from '../common/ProgressDisplay';
import UnderlinedHeader from '../common/UnderlinedHeader';
import SubtaskItem from '../common/SubtaskItem';
import ActionButtonsRow from '../common/ActionButtonsRow';
import ListContainer from '../common/ListContainer';
import TwoColumnSubtasks from '../common/TwoColumnSubtasks';
import { useAuth } from '@clerk/clerk-react';
import HistoryTaskDetail from './HistoryTaskDetail';

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
      completedAt?: string | null;
    };
    taskHistory?: {
      id: string;
      name: string;
      progress: number;
      deadline?: string | null;
      startDate?: string | null;
      completedAt?: string | null;
      subtasks?: { id: string; name: string; completed: boolean; completedAt?: string | null }[]; // Added for detail
      materials?: { name: string; amountUsed: number; usedAt: string }[]; // Added for detail
    }[];
  };
}

export default function MemberDetail({ member }: MemberDetailProps) {
  const [showAllSubtasks, setShowAllSubtasks] = useState(false);
  const [showAddSubtaskForm, setShowAddSubtaskForm] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [subtaskError, setSubtaskError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const [currentTask, setCurrentTask] = useState(member.currentTask);
  const [taskHistory, setTaskHistory] = useState(member.taskHistory || []);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    setCurrentTask(member.currentTask);
    setTaskHistory(member.taskHistory || []);
    setShowAllSubtasks(false);
    setShowAddSubtaskForm(false);
    setNewSubtaskName('');
    setSubtaskError(null);
    setShowAllHistory(false);
    setSelectedTask(null);
  }, [member]);

  if (!member) {
    return <EmptyPanel className="mb-6 mr-6 w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)]">Select a member to view performance.</EmptyPanel>; // Adjust 'mb-6' (bottom margin, e.g., mb-4 for smaller, mb-8 for larger) and 'mr-6' (right margin, e.g., mr-4 or mr-8) to your sweet spot; update the calc values accordingly (e.g., for mr-4 use w-[calc(100%-1rem)], since 4 is 1rem)
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
    const updatedTask = { ...task, subtasks: updatedSubtasks, progress: Math.round((updatedSubtasks.filter(s => s.completed).length / updatedSubtasks.length) * 100) };

    setCurrentTask(updatedTask);

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

      // SPA logic for auto-complete and pick next task
      const allCompleted = updatedSubtasks.every(s => s.completed);
      if (allCompleted) {
        const completedCurrent = { ...updatedTask, completedAt: new Date().toISOString() };

        // Find next most pressing pending task (earliest deadline)
        const pendingTasks = taskHistory.filter(t => !t.completedAt);
        pendingTasks.sort((a, b) => {
          const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          return da - db;
        });

        const nextTask = pendingTasks[0];

        let newHistory = taskHistory.filter(t => t.id !== (nextTask?.id || ''));
        newHistory = [...newHistory, completedCurrent]; // Add completed to history
        newHistory.sort((a, b) => {
          if (!a.completedAt && !b.completedAt) {
            return (a.deadline ? new Date(a.deadline).getTime() : Infinity) - (b.deadline ? new Date(b.deadline).getTime() : Infinity);
          } else if (!a.completedAt) {
            return -1;
          } else if (!b.completedAt) {
            return 1;
          } else {
            return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
          }
        });

        setTaskHistory(newHistory);

        if (nextTask) {
          setCurrentTask(nextTask);
        } else {
          setCurrentTask(null);
        }
      }
    } catch (err) {
      console.error('Error updating subtask:', err);
      // Revert
      setCurrentTask({ ...task, subtasks: task.subtasks });
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

  const sortedHistory = [
    ...taskHistory.filter(t => !t.completedAt).sort((a, b) => {
      const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return da - db;
    }),
    ...taskHistory.filter(t => t.completedAt).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
  ];

  const visibleHistoryTasks = showAllHistory ? sortedHistory : sortedHistory.slice(0, 10);

  const half = Math.ceil(visibleHistoryTasks.length / 2);
  const leftTasks = visibleHistoryTasks.slice(0, half);
  const rightTasks = visibleHistoryTasks.slice(half);

  return (
    <ScrollablePanel className="space-y-12" outerClassName="mb-6 mr-6 w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)]"> {/* Adjust 'mb-6' (bottom margin, e.g., mb-4 for smaller, mb-8 for larger) and 'mr-6' (right margin, e.g., mr-4 or mr-8) to your sweet spot; update the calc values accordingly (e.g., for mr-4 use w-[calc(100%-1rem)], since 4 is 1rem) */}
      {/* PROFILE HEADER */}
      <div>
        <UnderlinedHeader title="INDIVIDUAL PERFORMANCE" />
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
          </>
        ) : (
          <Typography variant="13" className="text-black italic">No current tasks have been assigned.</Typography>
        )}
      </div>

      {/* TASK HISTORY */}
      <div>
        <UnderlinedHeader title="TASK HISTORY" />
        {taskHistory.length > 0 ? (
          <div className="flex gap-4 mb-6">
            <div className="flex flex-col space-y-4 flex-1">
              {leftTasks.map((histTask) => (
                <div 
                  key={histTask.id} 
                  className="flex items-center cursor-pointer"
                  onClick={() => setSelectedTask(histTask)}
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
                  onClick={() => setSelectedTask(histTask)}
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
          {taskHistory.length > 10 && (
            <StyledLink onClick={() => setShowAllHistory(!showAllHistory)} className="text-black">
              <Typography variant="15" className="text-black">
                {showAllHistory ? 'HIDE HISTORY' : 'EXPAND HISTORY'}
              </Typography>
            </StyledLink>
          )}
        </ActionButtonsRow>
      </div>

      {/* PERFORMANCE CHART */}
      <div>
        <UnderlinedHeader title="PERFORMANCE CHART" />
        <Typography variant="13" className="text-black mb-4">Tailored to Contract Length</Typography>
        <img
          src="/performance-chart.png"
          alt="Performance Chart"
          className="w-full max-w-md rounded"
        />
      </div>

      {/* GROWTH FORECAST */}
      <div>
        <UnderlinedHeader title="GROWTH FORECAST" />
        <Typography variant="13" className="text-black mb-4">Based on Previous Performance</Typography>
        <img
          src="/growth-forecast.png"
          alt="Growth Forecast"
          className="w-full max-w-md rounded"
        />
      </div>

      {selectedTask && (
        <HistoryTaskDetail 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </ScrollablePanel>
  );
}