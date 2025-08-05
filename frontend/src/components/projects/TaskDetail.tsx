// frontend/src/components/projects/TaskDetail.tsx
import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface Subtask {
  id: string;
  name: string;
  completed: boolean;
}

interface HistoryEntry {
  id: string; // Added for unique key
  material: { id: string; name: string };
  teamMember: { name: string };
  previousLength: number;
  newLength: number;
  changedAt: string;
}

interface TaskMaterial {
  id: string;
  material: { id: string; name: string };
  amountUsed: number;
  usedAt: string;
  teamMember?: { name: string }; // For "Taken by" in fallback
}

interface Task {
  id: string;
  name: string;
  assignees: { teamMember: { id: string; name: string } }[];
  subtasks: Subtask[];
  materialHistories: HistoryEntry[];  // Use this for materials used details
  taskMaterials: TaskMaterial[]; // Added for fallback display
}

type TaskDetailProps = {
  task: Task;
  onClose: () => void;
  onRefresh: () => void; // Added: Prop to trigger refresh after changes
};

export default function TaskDetail({ task, onClose, onRefresh }: TaskDetailProps) {
  const [showAllMaterials, setShowAllMaterials] = useState(false);
  const [showAddSubtaskForm, setShowAddSubtaskForm] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [subtaskError, setSubtaskError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const visibleMaterials = showAllMaterials ? (task.materialHistories || []) : (task.materialHistories || []).slice(0, 5);

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
        setNewSubtaskName('');
        setShowAddSubtaskForm(false);
        onRefresh(); // Added: Trigger refresh to update subtasks without reopening
      } else {
        setSubtaskError('Failed to add subtask.');
      }
    } catch (err) {
      console.error('Error adding subtask:', err);
      setSubtaskError('Error adding subtask.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md max-w-lg w-full space-y-4">
        <h2 className="text-xl font-bold">{task.name}</h2>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Assigned Members</h3>
          {task.assignees?.length > 0 ? (
            <ul className="list-disc pl-5">
              {task.assignees.map((assignee) => (
                <li key={assignee.teamMember.id}>{assignee.teamMember.name}</li>
              ))}
            </ul>
          ) : (
            <p>No members assigned.</p>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Materials Used</h3>
          {task.materialHistories?.length > 0 || task.taskMaterials?.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-2">
                {task.materialHistories?.length > 0 ? (
                  visibleMaterials.map((h) => {
                    const amountUsed = h.previousLength - h.newLength;
                    return (
                      <div key={h.id}>
                        <p><strong>Taken by:</strong> {h.teamMember.name}</p>
                        <p><strong>Amount:</strong> -{amountUsed} meters</p>
                        <p><strong>New Amount:</strong> {h.newLength} meters</p>
                        <p><strong>Timestamp:</strong> {new Date(h.changedAt).toLocaleString()}</p>
                      </div>
                    );
                  })
                ) : (
                  task.taskMaterials.map((tm) => (
                    <div key={tm.id}>
                      <p><strong>Taken by:</strong> {tm.teamMember?.name || 'Unknown'}</p>
                      <p><strong>Material:</strong> {tm.material.name}</p>
                      <p><strong>Amount Used:</strong> {tm.amountUsed} meters</p>
                      <p><strong>Used At:</strong> {new Date(tm.usedAt).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
              {task.materialHistories?.length > 5 && (
                <button 
                  className="text-blue-500 underline"
                  onClick={() => setShowAllMaterials(!showAllMaterials)}
                >
                  {showAllMaterials ? 'Show Less' : 'Show More'}
                </button>
              )}
            </>
          ) : (
            <p>No materials used.</p>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Subtasks</h3>
          {task.subtasks?.length > 0 ? (
            <ul className="list-disc pl-5">
              {task.subtasks.map((sub) => ( // Removed index fallback, assuming id is always unique and present
                <li key={sub.id} className={sub.completed ? 'line-through text-gray-500' : ''}>
                  {sub.name} {sub.completed ? '(Completed)' : '(Pending)'}
                </li>
              ))}
            </ul>
          ) : (
            <p>No subtasks.</p>
          )}
          <button 
            className="text-blue-500 underline"
            onClick={() => setShowAddSubtaskForm(!showAddSubtaskForm)}
          >
            {showAddSubtaskForm ? 'Cancel' : 'Add Subtask'}
          </button>
          {showAddSubtaskForm && (
            <div className="mt-2">
              <input
                type="text"
                value={newSubtaskName}
                onChange={(e) => setNewSubtaskName(e.target.value)}
                placeholder="Subtask description"
                className="border p-2 rounded w-full mb-2"
              />
              {subtaskError && <p className="text-red-500 text-sm mb-2">{subtaskError}</p>}
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleAddSubtask}
              >
                Save
              </button>
            </div>
          )}
        </div>
        
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}