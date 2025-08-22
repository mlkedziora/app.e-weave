// frontend/src/components/team/AssignTask.tsx
import React, { useState, useEffect, useRef } from 'react';
import Typography from '../common/Typography';
import StyledLink from '../common/StyledLink';
import UnderlinedHeader from '../common/UnderlinedHeader';
import BlurryOverlayPanel from '../common/BlurryOverlayPanel';
import { useAuth } from '@clerk/clerk-react';
import SmartInput from '../common/SmartInput';

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  name: string;
  subtasks?: { id: string; name: string; completed: boolean; completedAt?: string | null }[];
  progress: number;
  deadline?: string | null;
  startDate?: string | null;
  materials?: { name: string; amountUsed: number; usedAt: string }[];
  completedAt?: string | null;
}

interface AssignTaskProps {
  member: {
    id: string;
    name: string;
  };
  onClose: () => void;
  onAssigned: (task: Task) => void;
}

export default function AssignTask({ member, onClose, onAssigned }: AssignTaskProps) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskStartDate, setNewTaskStartDate] = useState('');
  const [newTaskEndDate, setNewTaskEndDate] = useState('');
  const [showAddSubtaskForm, setShowAddSubtaskForm] = useState(false);
  const [newSubtaskNames, setNewSubtaskNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const textareaRefs = useRef<HTMLTextAreaElement[]>([]);

  const customInnerStyle = {
    marginTop: '0px',
    marginLeft: '0',
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
    if (selectedProjectId && mode === 'existing') {
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
  }, [selectedProjectId, mode, getToken]);

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

  const addNewLine = () => {
    setNewSubtaskNames((prev) => [...prev, '']);
  };

  const handleAddSubtask = async (name: string, taskId: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return null;
    }
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/subtasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId,
          name: trimmed,
        }),
      });
      if (res.ok) {
        const newSub = await res.json();
        return { id: newSub.id, name: trimmed, completed: false, completedAt: null };
      } else {
        const errorBody = await res.json();
        setError(`Failed to add subtask: ${errorBody.message || 'Unknown error'}`);
        return null;
      }
    } catch (err) {
      console.error('Error adding subtask:', err);
      setError('Error adding subtask, possibly due to network issues.');
      return null;
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

  const handleAssignExisting = async () => {
    if (!selectedProjectId || !selectedTaskId) {
      setError('Please select a project and task.');
      return;
    }
    try {
      const token = await getToken();
      const res = await fetch(`/api/tasks/${selectedTaskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignedMemberId: member.id,
        }),
      });
      if (res.ok) {
        const updatedTask = await res.json();
        onAssigned(updatedTask);
        onClose();
      } else {
        setError('Failed to assign task.');
      }
    } catch (err) {
      console.error('Error assigning task:', err);
      setError('Error assigning task.');
    }
  };

  const handleCreateAndAssign = async () => {
    if (!selectedProjectId || !newTaskName || !newTaskStartDate || !newTaskEndDate) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      const token = await getToken();
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: selectedProjectId,
          name: newTaskName,
          startDate: newTaskStartDate,
          deadline: newTaskEndDate,
          assignedMemberId: member.id,
          progress: 0,
        }),
      });
      if (res.ok) {
        let newTask = await res.json();
        const newSubs = [];
        for (const name of newSubtaskNames) {
          const sub = await handleAddSubtask(name, newTask.id);
          if (sub) {
            newSubs.push(sub);
          }
        }
        newTask.subtasks = newSubs;
        setNewSubtaskNames([]);
        onAssigned(newTask);
        onClose();
      } else {
        setError('Failed to create task.');
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Error creating task.');
    }
  };

  return (
    <BlurryOverlayPanel draggable={true} innerStyle={customInnerStyle} onClose={onClose}>
      <UnderlinedHeader title={`ASSIGN TASK TO ${member.name.toUpperCase()}`} />
      <div className="flex justify-between mb-6">
        <StyledLink onClick={() => setMode('existing')} className={mode === 'existing' ? 'text-black underline' : 'text-gray-500'}>
          <Typography variant="15">ASSIGN EXISTING TASK</Typography>
        </StyledLink>
        <StyledLink onClick={() => setMode('new')} className={mode === 'new' ? 'text-black underline' : 'text-gray-500'}>
          <Typography variant="15">CREATE NEW TASK</Typography>
        </StyledLink>
      </div>

      <div className="mb-6">
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

      {mode === 'existing' && selectedProjectId && (
        <>
          <div className="mb-6">
            <Typography variant="15" className="text-black mb-2">Select Task:</Typography>
            <SmartInput
              as="select"
              value={selectedTaskId || ''}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full uppercase text-left"
            >
              <option value="">CHOOSE A TASK...</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name.toUpperCase()}
                </option>
              ))}
            </SmartInput>
          </div>
          <div className="flex justify-center">
            <StyledLink onClick={handleAssignExisting} className="text-black">
              <Typography variant="15" className="text-black">ASSIGN</Typography>
            </StyledLink>
          </div>
        </>
      )}

      {mode === 'new' && selectedProjectId && (
        <>
          <div className="mb-6">
            <Typography variant="15" className="text-black mb-2">Task Name:</Typography>
            <SmartInput
              as="input"
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="ENTER TASK NAME..."
              className="w-full uppercase text-left"
            />
          </div>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Typography variant="15" className="text-black mb-2">Start Date:</Typography>
              <SmartInput
                as="input"
                type="date"
                value={newTaskStartDate}
                onChange={(e) => setNewTaskStartDate(e.target.value)}
                className="w-full text-left"
              />
            </div>
            <div className="flex-1">
              <Typography variant="15" className="text-black mb-2">End Date:</Typography>
              <SmartInput
                as="input"
                type="date"
                value={newTaskEndDate}
                onChange={(e) => setNewTaskEndDate(e.target.value)}
                className="w-full text-left"
              />
            </div>
          </div>
          <div className="mb-6">
            <StyledLink
              onClick={() => {
                setShowAddSubtaskForm(true);
                if (newSubtaskNames.length === 0) {
                  setNewSubtaskNames(['']);
                }
              }}
              className="text-black"
            >
              <Typography variant="15" className="text-black">ADD INITIAL SUBTASKS (OPTIONAL)</Typography>
            </StyledLink>
            {showAddSubtaskForm && (
              <div className="mt-4">
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
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <StyledLink onClick={handleCreateAndAssign} className="text-black">
              <Typography variant="15" className="text-black">CREATE AND ASSIGN</Typography>
            </StyledLink>
          </div>
        </>
      )}

      {error && <Typography variant="13" className="text-red-500 mt-4">{error}</Typography>}
      <div className="flex justify-center mt-6">
        <StyledLink onClick={onClose} className="text-black">
          <Typography variant="15" className="text-black">CANCEL</Typography>
        </StyledLink>
      </div>
    </BlurryOverlayPanel>
  );
}