// frontend/src/components/add-new/ProjectForm.tsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Typography from '../common/Typography';
import SmartInput from '../common/SmartInput';
import MaterialSelector from './MaterialSelector';
import UnderlinedHeader from '../common/UnderlinedHeader';

interface Member {
  id: string;
  name: string;
}
interface Material {
  id: string;
  name: string;
  category: string;
}
interface Task {
  name: string;
  startDate?: string;
  deadline?: string;
  subtasks: string[];
  assigneeId?: string;
}

/**
 * MemberMultiSelect
 * - Single trigger box
 * - Click to open/close dropdown
 * - Checkbox-like rows (uppercase), identical “feel” to your SmartInput select
 */
function MemberMultiSelect({
  members,
  value,
  onChange,
}: {
  members: Member[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleId = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const label =
    value.length === 0
      ? 'SELECT TEAM MEMBER'
      : members
          .filter((m) => value.includes(m.id))
          .map((m) => m.name.toUpperCase())
          .join(', ');

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Trigger styled like SmartInput pill */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full border border-gray-300 rounded-full px-4 py-2 text-black uppercase text-left focus:outline-none focus:ring-0 focus:border-black focus:shadow-[0_0_10px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)]"
      >
        {label}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full max-h-64 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg">
          <ul className="py-2">
            {members.map((m) => {
              const checked = value.includes(m.id);
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => toggleId(m.id)}
                    className={`w-full text-left px-4 py-2 text-[13px] uppercase ${
                      checked ? 'bg-gray-100' : ''
                    } hover:bg-gray-100`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`inline-block w-4 h-4 border border-black rounded-sm ${
                          checked ? 'bg-black' : 'bg-white'
                        }`}
                        aria-hidden
                      />
                      {m.name.toUpperCase()}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

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
    getToken({ template: 'backend-access' }).then(async (t) => {
      setToken(t);
      try {
        const [membersRes, materialsRes] = await Promise.all([
          fetch('/api/members', { headers: { Authorization: `Bearer ${t}` } }),
          fetch('/api/materials', { headers: { Authorization: `Bearer ${t}` } }),
        ]);
        if (!membersRes.ok) throw new Error('Failed to fetch members');
        if (!materialsRes.ok) throw new Error('Failed to fetch materials');
        setMembers(await membersRes.json());
        setMaterials(await materialsRes.json());
      } catch (err) {
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
      const res = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        resetForm();
        setError(null);
      } else {
        setError('Failed to create project');
      }
    } catch (err) {
      setError('Error creating project');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {error && <div className="col-span-2 text-red-500">{error}</div>}

      <div className="md:col-span-2 flex flex-col items-center">
        <img src={preview} alt="Project Preview" className="w-48 h-48 object-cover rounded-full mb-4" />
      </div>

      <label className="w-full border border-gray-300 rounded-full px-4 py-2 text-black focus-within:outline-none focus-within:border-black focus-within:shadow-[0_0_10px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] cursor-pointer text-center uppercase">
        CHOOSE FILE
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="hidden" />
      </label>

      <SmartInput
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="PROJECT NAME"
        required
        className="w-full text-center"
      />
      <SmartInput value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="START DATE" type="text" />
      <SmartInput value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="DEADLINE" type="text" />

      {/* HEADER FLUSH TO CARD EDGES */}
      <div className="col-span-2 -mx-4">
        <UnderlinedHeader title="TEAM & MATERIALS" />
      </div>

      {/* SINGLE BOX -> DROPDOWN FOR MEMBERS */}
      <div className="col-span-2">
        <MemberMultiSelect members={members} value={teamMemberIds} onChange={setTeamMemberIds} />
      </div>

      {/* MATERIAL CATEGORIES ON THEIR OWN LINE; SELECTOR HANDLES FULL-WIDTH HEADER */}
      <div className="col-span-2 mt-8">
        <MaterialSelector
          materials={materials}
          selected={materialIds}
          onSelect={(id) =>
            setMaterialIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
          }
        />
      </div>

      <div className="col-span-2">
        <button type="button" onClick={addTask} className="mb-4 text-black hover:underline uppercase">
          ADD TASK
        </button>

        {initialTasks.map((task, i) => (
          <div key={i} className="border p-4 mb-4 rounded-lg">
            <SmartInput
              value={task.name}
              onChange={(e) => updateTask(i, 'name', e.target.value)}
              placeholder="TASK NAME"
              className="mb-2 w-full"
            />
            <SmartInput
              value={task.startDate || ''}
              onChange={(e) => updateTask(i, 'startDate', e.target.value)}
              type="date"
              placeholder="START"
              className="mb-2 w-full"
            />
            <SmartInput
              value={task.deadline || ''}
              onChange={(e) => updateTask(i, 'deadline', e.target.value)}
              type="date"
              placeholder="DEADLINE"
              className="mb-2 w-full"
            />

            {/* Per-task single-select (kept as-is) */}
            <SmartInput
              as="select"
              value={task.assigneeId || ''}
              onChange={(e) => updateTask(i, 'assigneeId', e.target.value)}
              className="mb-2 w-full uppercase text-left"
            >
              <option value="">SELECT ASSIGNEE</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name.toUpperCase()}
                </option>
              ))}
            </SmartInput>

            <button type="button" onClick={() => addSubtask(i)} className="text-black hover:underline uppercase">
              ADD SUBTASK
            </button>
            {task.subtasks.map((sub, j) => (
              <SmartInput
                key={j}
                value={sub}
                onChange={(e) => updateSubtask(i, j, e.target.value)}
                placeholder="SUBTASK"
                className="mb-2 w-full"
              />
            ))}
          </div>
        ))}
      </div>

      <SmartInput
        as="textarea"
        value={initialNotes}
        onChange={(e) => setInitialNotes(e.target.value)}
        placeholder="INITIAL NOTES"
        rows={3}
        className="md:col-span-2"
      />

      <div className="col-span-full flex justify-center mb-6">
        <button type="submit" className="text-black hover:underline">
          <Typography variant="15" className="text-black">
            SAVE PROJECT
          </Typography>
        </button>
      </div>
    </form>
  );
}
