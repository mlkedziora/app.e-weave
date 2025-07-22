// frontend/src/components/add-new/ProjectForm.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import StyledLink from '../common/StyledLink';

interface Member { id: string; name: string; }
interface Material { id: string; name: string; }
interface Task { name: string; startDate?: string; deadline?: string; subtasks: string[]; assigneeId?: string; }

export default function ProjectForm() {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [initialNotes, setInitialNotes] = useState('');
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([]);
  const [materialIds, setMaterialIds] = useState<string[]>([]);
  const [initialTasks, setInitialTasks] = useState<Task[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('/project.jpg');
  const [members, setMembers] = useState<Member[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getToken({ template: 'backend-access' }).then(async (t) => { // Use correct token template
      setToken(t);
      try {
        const [membersRes, materialsRes] = await Promise.all([
          fetch('/api/members', { headers: { Authorization: `Bearer ${t}` } }), // Added /api
          fetch('/api/materials', { headers: { Authorization: `Bearer ${t}` } }), // Added /api
        ]);
        if (!membersRes.ok) throw new Error('Failed to fetch members');
        if (!materialsRes.ok) throw new Error('Failed to fetch materials');
        setMembers(await membersRes.json());
        setMaterials(await materialsRes.json());
      } catch (err) {
        console.error('Error loading members or materials:', err);
        setError('Failed to load members or materials');
      }
    });
  }, [getToken]);

  useEffect(() => {
    if (image) {
      setPreview(URL.createObjectURL(image));
    } else {
      setPreview('/project.jpg');
    }
  }, [image]);

  const addTask = () => setInitialTasks([...initialTasks, { name: '', subtasks: [] }]);

  const updateTask = (index: number, field: keyof Task, value: any) => {
    const updated = [...initialTasks];
    updated[index][field] = value;
    setInitialTasks(updated);
  };

  const addSubtask = (taskIndex: number) => {
    const updated = [...initialTasks];
    updated[taskIndex].subtasks.push('');
    setInitialTasks(updated);
  };

  const updateSubtask = (taskIndex: number, subIndex: number, value: string) => {
    const updated = [...initialTasks];
    updated[taskIndex].subtasks[subIndex] = value;
    setInitialTasks(updated);
  };

  const resetForm = () => {
    setName('');
    setStartDate('');
    setDeadline('');
    setInitialNotes('');
    setTeamMemberIds([]);
    setMaterialIds([]);
    setInitialTasks([]);
    setImage(null);
    setPreview('/project.jpg');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Authentication token missing');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    if (startDate) formData.append('startDate', startDate);
    if (deadline) formData.append('deadline', deadline);
    if (teamMemberIds.length) formData.append('teamMemberIds', JSON.stringify(teamMemberIds));
    if (materialIds.length) formData.append('materialIds', JSON.stringify(materialIds));
    if (initialNotes) formData.append('initialNotes', initialNotes);
    if (initialTasks.length) formData.append('initialTasks', JSON.stringify(initialTasks));
    if (image) formData.append('image', image);

    try {
      const res = await fetch('/api/projects', { // Added /api
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        console.log('Project created');
        resetForm();
        setError(null);
      } else {
        const text = await res.text();
        setError(`Failed to create project: ${text}`);
      }
    } catch (err) {
      console.error(err);
      setError('Error creating project');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {error && <div className="col-span-2 text-red-500">{error}</div>}
      <div className="md:col-span-2">
        <img src={preview} alt="Project Preview" className="w-full h-48 object-cover rounded mb-4" />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-black" />
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project Name" required className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start Date" type="date" className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="Deadline" type="date" className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <div className="col-span-2">
        <label className="block mb-2">Team Members</label>
        <select multiple value={teamMemberIds} onChange={(e) => setTeamMemberIds(Array.from(e.target.selectedOptions, o => o.value))} className="border border-gray-300 rounded px-3 py-2 w-full">
          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <div className="col-span-2">
        <label className="block mb-2">Materials</label>
        <select multiple value={materialIds} onChange={(e) => setMaterialIds(Array.from(e.target.selectedOptions, o => o.value))} className="border border-gray-300 rounded px-3 py-2 w-full">
          {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <div className="col-span-2">
        <button type="button" onClick={addTask} className="mb-4 text-black hover:underline">Add Task</button>
        {initialTasks.map((task, i) => (
          <div key={i} className="border p-4 mb-4 rounded">
            <input value={task.name} onChange={(e) => updateTask(i, 'name', e.target.value)} placeholder="Task Name" className="border border-gray-300 rounded px-3 py-2 mb-2 w-full" />
            <input value={task.startDate || ''} onChange={(e) => updateTask(i, 'startDate', e.target.value)} type="date" placeholder="Task Start" className="border border-gray-300 rounded px-3 py-2 mb-2 w-full" />
            <input value={task.deadline || ''} onChange={(e) => updateTask(i, 'deadline', e.target.value)} type="date" placeholder="Task Deadline" className="border border-gray-300 rounded px-3 py-2 mb-2 w-full" />
            <select value={task.assigneeId || ''} onChange={(e) => updateTask(i, 'assigneeId', e.target.value)} className="border border-gray-300 rounded px-3 py-2 mb-2 w-full">
              <option value="">Select Assignee</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <button type="button" onClick={() => addSubtask(i)} className="text-black hover:underline">Add Subtask</button>
            {task.subtasks.map((sub, j) => (
              <input key={j} value={sub} onChange={(e) => updateSubtask(i, j, e.target.value)} placeholder="Subtask" className="border border-gray-300 rounded px-3 py-2 mb-2 w-full" />
            ))}
          </div>
        ))}
      </div>
      <textarea value={initialNotes} onChange={(e) => setInitialNotes(e.target.value)} placeholder="Initial Notes" rows={3} className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black md:col-span-2" />
      <button type="submit" className="col-span-full text-black hover:underline block text-center">
        Save Project
      </button>
    </form>
  );
}