// frontend/src/components/inventory/UpdateQuantityModal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Typography from '../common/Typography';
import UnderlinedHeader from '../common/UnderlinedHeader';
import ActionButtonsRow from '../common/ActionButtonsRow';
import BlurryOverlayPanel from '../common/BlurryOverlayPanel';
import StyledLink from '../common/StyledLink';
import SmartInput from '../common/SmartInput';

type UpdateQuantityModalProps = {
  materialId: string;
  currentLength: number;
  onClose: () => void;
  onSuccess?: (newLength: number) => void; // Updated typing
};

type User = { id: string; name: string };
type Project = { id: string; name: string };
type Task = { id: string; name: string };

export default function UpdateQuantityModal({
  materialId,
  currentLength = 0,
  onClose,
  onSuccess,
}: UpdateQuantityModalProps) {
  const [newLength, setNewLength] = useState<number>(currentLength);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const customInnerStyle = {
    overflow: 'visible',
  };

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/members', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errMsg = await res.text();
          throw new Error(`Failed to load users: ${res.status} - ${errMsg}`);
        }
        const data = await res.json();
        setUsers(data.map((u: any) => ({ id: u.id, name: u.name })));
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load users.');
      }
    };
    fetchUsers();
  }, [getToken]);

  // Fetch all projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errMsg = await res.text();
          throw new Error(`Failed to load projects: ${res.status} - ${errMsg}`);
        }
        const data = await res.json();
        setProjects(data.map((p: any) => ({ id: p.id, name: p.name })));
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load projects.');
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
        if (!res.ok) {
          const errMsg = await res.text();
          throw new Error(`Failed to load tasks: ${res.status} - ${errMsg}`);
        }
        const data = await res.json();
        setTasks((data.tasks || []).map((t: any) => ({ id: t.id, name: t.name })));
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load tasks.');
      }
    };
    fetchTasks();
  }, [selectedProjectId, getToken]);

  const handleSubmit = async () => {
    if (isNaN(newLength) || newLength === undefined || newLength < 0 || newLength >= currentLength) {
      setError('Please enter a valid number less than current length to reduce quantity.');
      return;
    }
    if (!selectedUserId || !selectedTaskId) {
      setError('Please select a user, project, and task.');
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
          teamMemberId: selectedUserId,
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
    <BlurryOverlayPanel draggable={true} innerStyle={customInnerStyle} onClose={onClose}>
      <UnderlinedHeader title="UPDATE QUANTITY" />
      <div className="space-y-4 mb-6" onMouseDown={(e) => e.stopPropagation()}>
        <Typography variant="15" className="text-black mb-2">Select User:</Typography>
        <SmartInput
          as="select"
          value={selectedUserId}
          onChange={(e: any) => setSelectedUserId(e.target.value)}
          className="w-full uppercase text-left bg-white border border-black p-2"
          disabled={loading}
        >
          <option value="">CHOOSE A USER...</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name.toUpperCase()}</option>
          ))}
        </SmartInput>
        <Typography variant="15" className="text-black mb-2">Select Project:</Typography>
        <SmartInput
          as="select"
          value={selectedProjectId}
          onChange={(e: any) => setSelectedProjectId(e.target.value)}
          className="w-full uppercase text-left bg-white border border-black p-2"
          disabled={loading}
        >
          <option value="">CHOOSE A PROJECT...</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>
          ))}
        </SmartInput>
        <Typography variant="15" className="text-black mb-2">Select Task:</Typography>
        <SmartInput
          as="select"
          value={selectedTaskId}
          onChange={(e: any) => setSelectedTaskId(e.target.value)}
          className="w-full uppercase text-left bg-white border border-black p-2"
          disabled={!selectedProjectId || loading}
        >
          <option value="">CHOOSE A TASK...</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
          ))}
        </SmartInput>
        <Typography variant="15" className="text-black mb-2">New Length (in meters, must be less than current):</Typography>
        <SmartInput
          as="input"
          type="number"
          step="0.01"
          min="0"
          max={currentLength - 0.01}
          value={newLength ?? ''}
          onChange={(e: any) => {
            const val = parseFloat(e.target.value);
            setNewLength(isNaN(val) ? undefined : val);
          }}
          className="w-full bg-white border border-black p-2"
          disabled={loading}
        />
        {error && <Typography variant="13" className="text-red-600">{error}</Typography>}
      </div>
      <ActionButtonsRow>
        <StyledLink onClick={loading ? () => {} : handleSubmit} className="text-black">
          <Typography variant="15" className="text-black">{loading ? 'Saving...' : 'SAVE'}</Typography>
        </StyledLink>
        <StyledLink onClick={loading ? () => {} : onClose} className="text-black">
          <Typography variant="15" className="text-black">CANCEL</Typography>
        </StyledLink>
      </ActionButtonsRow>
    </BlurryOverlayPanel>
  );
}