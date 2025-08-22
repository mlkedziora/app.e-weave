// frontend/src/components/team/HistoryTaskDetail.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  onUpdate: (taskId: string, updated: any | null) => void;
}

export default function HistoryTaskDetail({ task: initialTask, onClose, onUpdate }: HistoryTaskDetailProps) {
  const [showAllSubtasks, setShowAllSubtasks] = useState(false);
  const [showAddSubtaskForm, setShowAddSubtaskForm] = useState(false);
  const [newSubtaskNames, setNewSubtaskNames] = useState<string[]>([]);
  const [subtaskError, setSubtaskError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const [task, setTask] = useState(initialTask);
  const textareaRefs = useRef<HTMLTextAreaElement[]>([]);

  const customInnerStyle = {
    marginTop: '0px',
    marginLeft: '0',
  };

  useEffect(() => {
    setTask(initialTask);
  }, [initialTask]);

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
    setTask((prevTask) => {
      const updatedSubtasks = [...(prevTask.subtasks || []), { id: tempId, name, completed: false, completedAt: null }];
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
        setTask((prevTask) => {
          const finalSubtasks = prevTask.subtasks?.map((s) =>
            s.id === tempId ? { ...s, id: newSub.id } : s
          ) || [];
          const finalTask = { ...prevTask, subtasks: finalSubtasks };
          onUpdate(task.id, finalTask);
          return finalTask;
        });
      } else {
        setTask((prevTask) => ({
          ...prevTask,
          subtasks: prevTask.subtasks?.filter((s) => s.id !== tempId) || [],
        }));
        const errorBody = await res.json();
        setSubtaskError(`Failed to add subtask: ${errorBody.message || 'Unknown error'}`);
      }
    } catch (err) {
      setTask((prevTask) => ({
        ...prevTask,
        subtasks: prevTask.subtasks?.filter((s) => s.id !== tempId) || [],
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
    const oldTask = { ...task };
    setTask((prevTask) => {
      const newSubs = namesToAdd.map((name, i) => ({
        id: tempIds[i],
        name,
        completed: false,
        completedAt: null,
      }));
      const updatedSubtasks = [...(prevTask.subtasks || []), ...newSubs];
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
          setTask((prevTask) => {
            const finalSubtasks = prevTask.subtasks?.map((s) =>
              s.id === tempIds[i] ? { ...s, id: newSub.id } : s
            ) || [];
            return { ...prevTask, subtasks: finalSubtasks };
          });
        } else {
          hasError = true;
          const errorBody = await res.json();
          setSubtaskError(`Failed to add some subtasks: ${errorBody.message || 'Unknown error'}`);
          // Remove the failed one
          setTask((prevTask) => ({
            ...prevTask,
            subtasks: prevTask.subtasks?.filter((s) => s.id !== tempIds[i]) || [],
          }));
        }
      }
      if (!hasError) {
        onUpdate(task.id, task);
      } else {
        onUpdate(task.id, oldTask); // Or partial update
      }
    } catch (err) {
      setTask(oldTask);
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
    const oldTask = { ...task };
    const updatedSubtasks = task.subtasks?.filter(s => s.id !== subtaskId) || [];
    const updatedTask = { ...task, subtasks: updatedSubtasks, progress: updatedSubtasks.length > 0 ? Math.round((updatedSubtasks.filter(s => s.completed).length / updatedSubtasks.length) * 100) : 0 };
    setTask(updatedTask);
    try {
      const token = await getToken();
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        onUpdate(task.id, updatedTask);
      } else {
        setTask(oldTask);
        alert('Failed to delete subtask.');
      }
    } catch (err) {
      setTask(oldTask);
      console.error('Error deleting subtask:', err);
      alert('Error deleting subtask.');
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    const subtask = task.subtasks?.find(s => s.id === subtaskId);
    if (!subtask) return;

    const oldTask = { ...task };
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

      const allCompleted = updatedSubtasks.every(s => s.completed);
      let finalTask = updatedTask;
      if (allCompleted && !task.completedAt) {
        finalTask = { ...updatedTask, completedAt: new Date().toISOString() };
        setTask(finalTask);
      }
      onUpdate(task.id, finalTask);
    } catch (err) {
      setTask(oldTask);
      console.error('Error updating subtask:', err);
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
        onUpdate(task.id, null);
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
    <BlurryOverlayPanel draggable={true} innerStyle={customInnerStyle} onClose={onClose}>
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
              <StyledLink onClick={handleAddAll} className="text-black">
                <Typography variant="15" className="text-black">ADD ALL</Typography>
              </StyledLink>
              <StyledLink onClick={handleCancelAll} className="text-black">
                <Typography variant="15" className="text-black">CANCEL ALL</Typography>
              </StyledLink>
            </div>
          )}
          {subtaskError && <Typography variant="13" className="text-red-500 mb-2">{subtaskError}</Typography>}
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