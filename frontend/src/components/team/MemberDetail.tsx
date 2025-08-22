// frontend/src/components/team/MemberDetail.tsx
import React, { useState, useEffect, useRef } from 'react';
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
import HistoryListOverlay from './HistoryListOverlay';
import AssignTask from './AssignTask';

interface MemberDetailProps {
  member: {
    id: string;
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
  const [newSubtaskNames, setNewSubtaskNames] = useState<string[]>([]);
  const [subtaskError, setSubtaskError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const [currentTask, setCurrentTask] = useState(member.currentTask);
  const [taskHistory, setTaskHistory] = useState(member.taskHistory || []);
  const [showHistoryOverlay, setShowHistoryOverlay] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAssignTask, setShowAssignTask] = useState(false);
  const textareaRefs = useRef<HTMLTextAreaElement[]>([]);

  useEffect(() => {
    setCurrentTask(member.currentTask);
    setTaskHistory(member.taskHistory || []);
    setShowAllSubtasks(false);
    setShowAddSubtaskForm(false);
    setNewSubtaskNames([]);
    setSubtaskError(null);
    setShowHistoryOverlay(false);
    setSelectedTask(null);
  }, [member]);

  useEffect(() => {
    textareaRefs.current.forEach((ta) => {
      if (ta) {
        ta.style.height = 'auto';
        ta.style.height = `${ta.scrollHeight}px`;
      }
    });
  }, [newSubtaskNames]);

  useEffect(() => {
    const lastIndex = newSubtaskNames.length - 1;
    if (lastIndex >= 0) {
      const last = textareaRefs.current[lastIndex];
      if (last) {
        last.focus();
      }
    }
  }, [newSubtaskNames.length]);

  useEffect(() => {
    if (newSubtaskNames.length === 0 && showAddSubtaskForm) {
      setShowAddSubtaskForm(false);
    }
  }, [newSubtaskNames, showAddSubtaskForm]);

  if (!member) {
    return <EmptyPanel className="mb-6 mr-6 w-[calc(100%-4.5rem)] h-[calc(100%-4.5rem)]">Select a member to view performance.</EmptyPanel>; // Adjust 'mb-6' (bottom margin, e.g., mb-4 for smaller, mb-8 for larger) and 'mr-6' (right margin, e.g., mr-4 or mr-8) to your sweet spot; update the calc values to account for margins + internal paddings (p-6 adds 1.5rem per side), e.g., for mr-4 (1rem) use w-[calc(100%-4rem)] since 1.5rem (pl) + 1.5rem (pr) + 1rem (mr) = 4rem
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

  const addNewLine = () => {
    setNewSubtaskNames((prev) => [...prev, '']);
  };

  const handleAdd = async (index: number) => {
    const name = newSubtaskNames[index].trim();
    if (!name) {
      setSubtaskError('Enter a subtask description.');
      return;
    }
    setSubtaskError(null);
    const tempId = `temp-${Date.now()}-${index}`;
    setCurrentTask((prevTask) => {
      const updatedSubtasks = [...(prevTask?.subtasks || []), { id: tempId, name, completed: false, completedAt: null }];
      return { ...prevTask, subtasks: updatedSubtasks };
    });
    setNewSubtaskNames((prev) => {
      const newPrev = [...prev];
      newPrev.splice(index, 1);
      return newPrev;
    });
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
          name,
        }),
      });
      if (res.ok) {
        const newSub = await res.json();
        setCurrentTask((prevTask) => {
          const finalSubtasks = prevTask?.subtasks?.map((s) =>
            s.id === tempId ? { ...s, id: newSub.id } : s
          ) || [];
          return { ...prevTask, subtasks: finalSubtasks };
        });
      } else {
        setCurrentTask((prevTask) => ({
          ...prevTask,
          subtasks: prevTask?.subtasks?.filter((s) => s.id !== tempId) || [],
        }));
        const errorBody = await res.json();
        setSubtaskError(`Failed to add subtask: ${errorBody.message || 'Unknown error'}`);
      }
    } catch (err) {
      setCurrentTask((prevTask) => ({
        ...prevTask,
        subtasks: prevTask?.subtasks?.filter((s) => s.id !== tempId) || [],
      }));
      console.error('Error adding subtask:', err);
      setSubtaskError('Error adding subtask, possibly due to network issues.');
    }
  };

  const handleAddAll = async () => {
    const namesToAdd = newSubtaskNames.filter((n) => n.trim());
    if (namesToAdd.length === 0) {
      setSubtaskError('No subtasks to add.');
      return;
    }
    setSubtaskError(null);
    const tempIds = namesToAdd.map((_, i) => `temp-all-${Date.now()}-${i}`);
    const oldTask = { ...currentTask };
    setCurrentTask((prevTask) => {
      const newSubs = namesToAdd.map((name, i) => ({
        id: tempIds[i],
        name,
        completed: false,
        completedAt: null,
      }));
      const updatedSubtasks = [...(prevTask?.subtasks || []), ...newSubs];
      return { ...prevTask, subtasks: updatedSubtasks };
    });
    setNewSubtaskNames([]);
    try {
      const token = await getToken();
      let hasError = false;
      for (let i = 0; i < namesToAdd.length; i++) {
        const res = await fetch('/api/subtasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            taskId: task.id,
            name: namesToAdd[i],
          }),
        });
        if (res.ok) {
          const newSub = await res.json();
          setCurrentTask((prevTask) => {
            const finalSubtasks = prevTask?.subtasks?.map((s) =>
              s.id === tempIds[i] ? { ...s, id: newSub.id } : s
            ) || [];
            return { ...prevTask, subtasks: finalSubtasks };
          });
        } else {
          hasError = true;
          const errorBody = await res.json();
          setSubtaskError(`Failed to add some subtasks: ${errorBody.message || 'Unknown error'}`);
          // Remove the failed one
          setCurrentTask((prevTask) => ({
            ...prevTask,
            subtasks: prevTask?.subtasks?.filter((s) => s.id !== tempIds[i]) || [],
          }));
        }
      }
    } catch (err) {
      setCurrentTask(oldTask);
      console.error('Error adding subtasks:', err);
      setSubtaskError('Error adding subtasks, possibly due to network issues.');
    }
  };

  const handleCancel = (index: number) => {
    setNewSubtaskNames((prev) => {
      const newPrev = [...prev];
      newPrev.splice(index, 1);
      return newPrev;
    });
  };

  const handleCancelAll = () => {
    setNewSubtaskNames([]);
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

  const handleTaskUpdate = (taskId: string, updated: any | null) => {
    if (updated === null) {
      setTaskHistory((prev) => prev.filter((t) => t.id !== taskId));
      if (currentTask?.id === taskId) {
        setCurrentTask(null);
      }
      setSelectedTask(null);
    } else {
      setTaskHistory((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updated } : t)));
      if (currentTask?.id === taskId) {
        setCurrentTask({ ...currentTask, ...updated });
      }
      setSelectedTask({ ...selectedTask, ...updated });
    }
  };

  const handleTaskAssigned = (newTask) => {
    if (!currentTask) {
      setCurrentTask(newTask);
    } else {
      setTaskHistory([...taskHistory, newTask]);
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

  const visibleHistoryTasks = sortedHistory.slice(0, 10);

  const half = Math.ceil(visibleHistoryTasks.length / 2);
  const leftTasks = visibleHistoryTasks.slice(0, half);
  const rightTasks = visibleHistoryTasks.slice(half);

  return (
    <ScrollablePanel className="space-y-12" outerClassName="mb-6 mr-6 w-[calc(100%-4.5rem)] h-[calc(100%-4.5rem)]"> {/* Adjust 'mb-6' (bottom margin, e.g., mb-4 for smaller, mb-8 for larger) and 'mr-6' (right margin, e.g., mr-4 or mr-8) to your sweet spot; update the calc values to account for margins + internal paddings (p-6 adds 1.5rem per side), e.g., for mr-4 (1rem) use w-[calc(100%-4rem)] since 1.5rem (pl) + 1.5rem (pr) + 1rem (mr) = 4rem */}
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
              <StyledLink
                onClick={() => {
                  setShowAddSubtaskForm(true);
                  if (newSubtaskNames.length === 0) {
                    setNewSubtaskNames(['']);
                  }
                }}
                className="text-black"
              >
                <Typography variant="15" className="text-black">ADD SUBTASK</Typography>
              </StyledLink>
              <StyledLink onClick={() => setShowAllSubtasks(!showAllSubtasks)} className="text-black">
                <Typography variant="15" className="text-black">
                  {showAllSubtasks ? 'HIDE SUBTASKS' : 'EXPAND SUBTASKS'}
                </Typography>
              </StyledLink>
            </ActionButtonsRow>
            {showAddSubtaskForm && (
              <div className="mt-6">
                <UnderlinedHeader title="NEW SUBTASKS" />
                <div className="space-y-4 mb-6">
                  {newSubtaskNames.map((name, index) => (
                    <div key={index} className="relative flex items-start">
                      <div className="w-4 h-4 border border-black rounded-full flex items-center justify-center mr-2 flex-shrink-0"></div>
                      <textarea
                        ref={(el) => (textareaRefs.current[index] = el)}
                        value={name}
                        onChange={(e) => {
                          const newNames = [...newSubtaskNames];
                          newNames[index] = e.target.value;
                          setNewSubtaskNames(newNames);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            addNewLine();
                          }
                        }}
                        className="flex-1 bg-transparent border-none focus:outline-none resize-none overflow-hidden text-black text-[13px]"
                        placeholder="Subtask description"
                        rows={1}
                      />
                      <div className="absolute top-0 right-0 flex gap-4">
                        <StyledLink onClick={() => handleAdd(index)} className="text-black">
                          <Typography variant="15" className="text-black">ADD</Typography>
                        </StyledLink>
                        <StyledLink onClick={() => handleCancel(index)} className="text-black">
                          <Typography variant="15" className="text-black">CANCEL</Typography>
                        </StyledLink>
                      </div>
                    </div>
                  ))}
                </div>
                {newSubtaskNames.length > 1 && (
                  <div className="flex justify-between mb-6">
                    <StyledLink onClick={handleCancelAll} className="text-black">
                      <Typography variant="15" className="text-black">CANCEL ALL</Typography>
                    </StyledLink>
                    <StyledLink onClick={handleAddAll} className="text-black">
                      <Typography variant="15" className="text-black">ADD ALL</Typography>
                    </StyledLink>
                  </div>
                )}
                {subtaskError && <Typography variant="13" className="text-red-500 mb-2">{subtaskError}</Typography>}
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
          <StyledLink onClick={() => setShowAssignTask(true)} className="text-black">
            <Typography variant="15" className="text-black">ASSIGN TASK</Typography>
          </StyledLink>
          {taskHistory.length > 10 && (
            <StyledLink onClick={() => setShowHistoryOverlay(true)} className="text-black">
              <Typography variant="15" className="text-black">EXPAND HISTORY</Typography>
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

      {showHistoryOverlay && (
        <HistoryListOverlay 
          taskHistory={taskHistory} 
          onClose={() => setShowHistoryOverlay(false)} 
          onSelectTask={(task) => setSelectedTask(task)} 
        />
      )}
      {selectedTask && (
        <HistoryTaskDetail 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={handleTaskUpdate}
        />
      )}
      {showAssignTask && (
        <AssignTask 
          member={{ id: member.id, name: member.name }} 
          onClose={() => setShowAssignTask(false)} 
          onAssigned={handleTaskAssigned} 
        />
      )}
    </ScrollablePanel>
  );
}