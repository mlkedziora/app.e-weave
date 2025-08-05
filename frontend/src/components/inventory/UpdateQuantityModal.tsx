import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

type UpdateQuantityModalProps = {
  materialId: string;
  currentLength: number;
  onClose: () => void;
  onSuccess?: (newLength: number) => void; // Updated typing
};

type Project = { id: string; name: string };
type Task = { id: string; name: string };

export default function UpdateQuantityModal({
  materialId,
  currentLength = 0,
  onClose,
  onSuccess,
}: UpdateQuantityModalProps) {
  const [newLength, setNewLength] = useState<number>(currentLength);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  // Fetch all projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data.map((p: any) => ({ id: p.id, name: p.name })));
        }
      } catch (err) {
        setError('Failed to load projects.');
      }
    };
    fetchProjects();
  }, [getToken]);

  // Fetch tasks for selected project
  useEffect(() => {
    if (!selectedProjectId) {
      setTasks([]);
      setSelectedTaskId('');
      return;
    }
    const fetchTasks = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`/api/projects/${selectedProjectId}?t=${Date.now()}`, { // Add cache busting
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTasks((data.tasks || []).map((t: any) => ({ id: t.id, name: t.name })));
        }
      } catch (err) {
        setError('Failed to load tasks.');
      }
    };
    fetchTasks();
  }, [selectedProjectId, getToken]);

  const handleSubmit = async () => {
    if (isNaN(newLength) || newLength === undefined || newLength < 0 || newLength >= currentLength) {
      setError('Please enter a valid number less than current length to reduce quantity.');
      return;
    }
    if (!selectedTaskId) {
      setError('Please select a project and task.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();

      const res = await fetch(`/api/materials/${materialId}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          previousLength: currentLength,
          newLength,
          taskId: selectedTaskId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to update: ${res.status} – ${data.message || await res.text()}`);
      }

      await res.json();
      console.log('[UpdateQuantityModal] Update successful');
      onSuccess?.(newLength); // Call with newLength to trigger refresh
      onClose();
    } catch (err: any) {
      console.error('[UpdateQuantityModal] Error:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 p-6 overflow-y-auto shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Reduce Material Quantity</h2>

      <label className="block text-sm font-medium mb-1">
        Select Project:
      </label>
      <select
        value={selectedProjectId}
        onChange={(e) => setSelectedProjectId(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      >
        <option value="">Choose a project...</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <label className="block text-sm font-medium mb-1">
        Select Task:
      </label>
      <select
        value={selectedTaskId}
        onChange={(e) => setSelectedTaskId(e.target.value)}
        className="border p-2 rounded w-full mb-4"
        disabled={!selectedProjectId}
      >
        <option value="">Choose a task...</option>
        {tasks.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <label className="block text-sm font-medium mb-1">
        New Length (in meters, must be less than current):
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        max={currentLength - 0.01}  // Enforce less than current
        className="border p-2 rounded w-full mb-4"
        value={newLength ?? ''}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          setNewLength(isNaN(val) ? undefined : val);
        }}
      />

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <div className="flex gap-3 mt-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          className="border border-gray-400 px-4 py-2 rounded"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}