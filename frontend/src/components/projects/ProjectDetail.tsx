// frontend/src/components/projects/ProjectDetail.tsx
import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import ScrollablePanel from '../common/ScrollablePanel'
import Typography from '../common/Typography'
import StyledLink from '../common/StyledLink'
import UnderlinedHeader from '../common/UnderlinedHeader'
import ActionButtonsRow from '../common/ActionButtonsRow'
import RecentNotesTable from '../common/RecentNotesTable'
import ProjectMaterialCategory from './ProjectMaterialCategory'
import TaskDetail from './TaskDetail';
import AddNoteModal from '../notes/AddNoteModal'; // Import from shared
import EditNoteModal from '../notes/EditNoteModal'; // Import from shared
import AllNotesModal from '../notes/AllNotesModal'; // Import from shared

interface TaskAssignee {
  teamMember: {
    id: string
    name: string
  }
}

interface Task {
  id: string
  name: string
  progress: number
  assignees: TaskAssignee[]
}

interface Material {
  id: string
  name: string
  category: string
  length: number
  eScore: number
  imageUrl?: string
}

interface Note {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
  teamMember?: {
    id: string
    userId: string
    name: string
  }
}

interface ProjectDetailData {
  id: string
  name: string
  description?: string
  startDate?: string
  deadline?: string
  tasks: Task[]
  materials: Material[]
  notes?: Note[]
  assignees?: { id: string; name: string; role?: string; imageUrl?: string }[]  // Flattened, optional for null-safety
}

interface Member { id: string; name: string; }

const CIRCLE_RADIUS = 60; // Adjust this const to change the size of all circular bars at once
const STROKE_WIDTH = 3; // Adjust this const to change the thickness of the blue loaded part
const BACKGROUND_STROKE_WIDTH =3; // Adjust this const to change the light grey width
const LOADED_COLOR = '#46afffff'; // Adjust this const to change the blue color of the loaded part
const METRICS_GAP_CLASS = 'gap-6'; // Adjust this to change the space gap between the circular bars, e.g., 'gap-8' for larger gap. Note: If it doesn't seem to work, ensure your Tailwind config includes the gap utilities and try increasing the value significantly for testing.
const METRICS_BOTTOM_MARGIN_CLASS = 'mb-10'; // Adjust this to change the space between the metrics row and the "ADDITIONAL METRICS +" button, e.g., 'mb-8' for more space. This is the class on the div with className={`flex justify-between ${METRICS_PADDING_CLASS} ${METRICS_GAP_CLASS} ${METRICS_BOTTOM_MARGIN_CLASS}`}
const METRICS_PADDING_CLASS = 'px-55'; // Adjust this to change the distance between the left and right edges of the panel for the circular metrics, e.g., 'px-8' for more padding on sides
const PROTOTYPE_MARGIN_BOTTOM_CLASS = 'mb-10'; // Adjust this to change the gap between "Prototype – Based on PEFCR Guidelines" and the circular metrics, e.g., 'mb-6' for larger gap
const TEXT_VERTICAL_OFFSET = '-7px'; // Adjust this const to move the inside text higher (more negative) or lower (positive). e.g., '-4px' to move higher.
const BOTTOM_PANEL_PADDING = 'pb-5'; // Adjust this to change the space gap between the last buttons and the end of the scrollable panel on the bottom

const CircularProgress = ({ value, max, label, unit }: { value: number; max: number; label: string; unit: string }) => {
  const percentage = Math.min((value / max) * 100, 100); // Cap at 100%
  const normalizedRadius = CIRCLE_RADIUS - STROKE_WIDTH / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg
        height={CIRCLE_RADIUS * 2}
        width={CIRCLE_RADIUS * 2}
        className="transform rotate-[-90deg]"
      >
        <circle
          stroke="#d1d5db" // Light grey for not loaded
          fill="transparent"
          strokeWidth={BACKGROUND_STROKE_WIDTH}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={CIRCLE_RADIUS}
          cy={CIRCLE_RADIUS}
        />
        <circle
          stroke={LOADED_COLOR} // Blue for loaded
          fill="transparent"
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={CIRCLE_RADIUS}
          cy={CIRCLE_RADIUS}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-center" style={{ transform: `translateY(${TEXT_VERTICAL_OFFSET})` }}>
        <Typography variant="15" className="text-black whitespace-nowrap">
          {value.toFixed(0)} {unit}
        </Typography>
      </div>
      <Typography variant="13" className="text-black mt-2 text-center">
        {label}
      </Typography>
    </div>
  );
};

export default function ProjectDetail({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<ProjectDetailData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAllTasks, setShowAllTasks] = useState(false)
  const [showAllMembers, setShowAllMembers] = useState(false)
  const [showAllMaterials, setShowAllMaterials] = useState(false)
  const [showAllNotes, setShowAllNotes] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const { getToken, userId: currentUserId, isLoaded, isSignedIn } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [allMaterials, setAllMaterials] = useState<Material[]>([])
  const [showAddTaskForm, setShowAddTaskForm] = useState(false)
  const [showAddMemberForm, setShowAddMemberForm] = useState(false)
  const [showAddMaterialForm, setShowAddMaterialForm] = useState(false)
  const [newTaskName, setNewTaskName] = useState('')
  const [newStartDate, setNewStartDate] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [newAssigneeId, setNewAssigneeId] = useState('')
  const [newSubtasks, setNewSubtasks] = useState<string[]>([])
  const [newMemberIds, setNewMemberIds] = useState<string[]>([])
  const [activeAddCategory, setActiveAddCategory] = useState('Fabrics')
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([])
  const [materialSearch, setMaterialSearch] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const allCategories = ['Fabrics', 'Other']; // Assuming based on context; adjust as needed

  const fetchProjectDetails = async () => {
    setError(null);
    try {
      const token = await getToken({ template: 'backend-access' });
      if (!token) {
        throw new Error('Authentication token unavailable. Please refresh or sign in again.');
      }
      const res = await fetch(`/api/projects/${projectId}?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      setProject({
        ...data,
        tasks: (data.tasks || []).map(t => ({ ...t, assignees: t.assignees || [] })),
      });
    } catch (err) {
      console.error('Failed to load project:', err);
      setError('Failed to load project details. Please try again.');
    }
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    fetchProjectDetails()
  }, [projectId, isLoaded, isSignedIn])

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = await getToken({ template: 'backend-access' })
        const [membersRes, materialsRes] = await Promise.all([
          fetch('/api/members', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/materials', { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (!membersRes.ok || !materialsRes.ok) throw new Error('Failed to fetch resources')
        setMembers(await membersRes.json())
        setAllMaterials(await materialsRes.json())
      } catch (err) {
        console.error('Error loading members or materials:', err)
      }
    }
    if (isLoaded && isSignedIn) fetchResources()
  }, [isLoaded, isSignedIn, getToken])

  const refreshNotes = async () => {
    try {
      await fetchProjectDetails() 
    } catch (err) {
      console.error('Failed to refresh notes:', err)
    }
  }

  if (!isLoaded) {
    return <div className="w-full bg-white p-6 rounded-lg shadow-md text-black h-full flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return (
      <div className="w-full bg-white p-6 rounded-lg shadow-md text-black h-full flex flex-col items-center justify-center">
        {error}
        <button onClick={fetchProjectDetails} className="mt-2 text-blue-500 underline">Retry</button>
      </div>
    )
  }

  if (!project) {
    return <div className="w-full bg-white p-6 rounded-lg shadow-md text-black h-full flex items-center justify-center">Loading project details...</div>
  }

  const sortedTasks = [...project.tasks].sort((a, b) => {
    if (a.progress === 100 && b.progress < 100) return 1
    if (a.progress < 100 && b.progress === 100) return -1
    return a.progress - b.progress
  })
  const visibleTasks = showAllTasks ? sortedTasks : sortedTasks.slice(0, 10)
  const halfTasks = Math.ceil(visibleTasks.length / 2);
  const leftTasks = visibleTasks.slice(0, halfTasks);
  const rightTasks = visibleTasks.slice(halfTasks);

  const visibleMembers = showAllMembers ? (project.assignees || []) : (project.assignees || []).slice(0, 4);

  const calculateEScore = () => {
    if (!project.materials.length) return 0
    const total = project.materials.reduce((sum, m) => sum + m.eScore, 0)
    return Math.round(total / project.materials.length)
  }

  const calculateCompletion = () => {
    if (!project.tasks.length) return 0
    const total = project.tasks.reduce((sum, t) => sum + t.progress, 0)
    return Math.round(total / project.tasks.length)
  }

  const addNewSubtask = () => setNewSubtasks([...newSubtasks, ''])

  const updateNewSubtask = (index: number, value: string) => {
    const updated = [...newSubtasks]
    updated[index] = value
    setNewSubtasks(updated)
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskName.trim()) return
    try {
      const token = await getToken({ template: 'backend-access' })
      const body = {
        projectId: project.id,
        name: newTaskName,
        startedAt: newStartDate || new Date().toISOString().split('T')[0],
        deadline: newDeadline || undefined,
        assigneeId: newAssigneeId || undefined,
        subtasks: newSubtasks.filter((s) => s.trim())
      }
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        fetchProjectDetails()
        setNewTaskName('')
        setNewStartDate('')
        setNewDeadline('')
        setNewAssigneeId('')
        setNewSubtasks([])
        setShowAddTaskForm(false)
      } else {
        alert('Failed to add task')
      }
    } catch (err) {
      console.error('Error adding task:', err)
      alert('Error adding task')
    }
  }

  const handleAddMembers = async () => {
    if (!newMemberIds.length) return
    try {
      const token = await getToken({ template: 'backend-access' })
      const res = await fetch(`/api/projects/${project.id}/assignees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamMemberIds: newMemberIds }),
      })
      if (res.ok) {
        fetchProjectDetails()
        setNewMemberIds([])
        setShowAddMemberForm(false)
      } else {
        alert('Failed to add members')
      }
    } catch (err) {
      console.error('Error adding members:', err)
      alert('Error adding members')
    }
  }

  const toggleMaterialSelect = (id: string) => {
    setSelectedMaterialIds((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    )
  }

  const handleAddMaterials = async () => {
    if (!selectedMaterialIds.length) return
    try {
      const token = await getToken({ template: 'backend-access' })
      const res = await fetch(`/api/projects/${project.id}/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ materialIds: selectedMaterialIds }),
      })
      if (res.ok) {
        fetchProjectDetails()
        setSelectedMaterialIds([])
        setMaterialSearch('')
        setShowAddMaterialForm(false)
      } else {
        alert('Failed to add materials')
      }
    } catch (err) {
      console.error('Error adding materials:', err)
      alert('Error adding materials')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Delete this note?')) {
      try {
        const token = await getToken({ template: 'backend-access' });
        const res = await fetch(`/api/projects/notes/${noteId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorBody = await res.json();
          console.error(`[DeleteNote] Failed: Status ${res.status}, Body:`, errorBody);
          alert('Failed to delete');
        } else {
          console.log('[DeleteNote] Success');
          refreshNotes();
        }
      } catch (err) {
        console.error('[DeleteNote] Error:', err);
        alert('Error deleting');
      }
    }
  };

  return (
    <ScrollablePanel className={`space-y-12 ${BOTTOM_PANEL_PADDING}`}>
      {/* PROJECT DETAILS */}
      <div>
        <UnderlinedHeader title="PROJECT DETAILS" />
        <div className="flex gap-8">
          <img
            src="/project.jpg"
            alt="Project"
            className="w-48 h-48 object-cover rounded"
          />
          <div className="space-y-4">
            <Typography variant="15" className="text-black">Project Name: {project.name}</Typography>
            <Typography variant="15" className="text-black">Description: {project.description || '—'}</Typography>
            <Typography variant="15" className="text-black">Start Date: {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</Typography>
            <Typography variant="15" className="text-black">Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</Typography>
            <Typography variant="15" className="text-black">Tasks Count: {project.tasks.length}</Typography>
          </div>
        </div>
      </div>

      {/* COMPLETION METRICS */}
      <div>
        <UnderlinedHeader title="COMPLETION METRICS" />
        <Typography variant="13" className={`text-black ${PROTOTYPE_MARGIN_BOTTOM_CLASS}`}>Prototype – Based on PEFCR Guidelines & Team Performance</Typography>
        <div className={`flex justify-between ${METRICS_PADDING_CLASS} ${METRICS_GAP_CLASS} ${METRICS_BOTTOM_MARGIN_CLASS}`}>
          <CircularProgress 
            value={calculateEScore()} 
            max={100} 
            label="E-Score" 
            unit=""
          />
          <CircularProgress 
            value={calculateCompletion()} 
            max={100} 
            label="Completion" 
            unit="%"
          />
        </div>
      </div>

      {/* ASSIGNED TASKS */}
      <div>
        <UnderlinedHeader title="ASSIGNED TASKS" />
        {project.tasks.length > 0 ? (
          <div className="flex gap-4 mb-6">
            <div className="flex flex-col space-y-4 flex-1">
              {leftTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="w-4 h-4 border border-black rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    {task.progress === 100 && <div className="w-2 h-2 bg-black rounded-full" />}
                  </div>
                  <Typography variant="15" className="text-black">
                    {task.name} ({task.assignees.map(a => a.teamMember.name).join(', ') || 'Unassigned'})
                  </Typography>
                </div>
              ))}
            </div>
            <div className="flex flex-col space-y-4 flex-1">
              {rightTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="w-4 h-4 border border-black rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    {task.progress === 100 && <div className="w-2 h-2 bg-black rounded-full" />}
                  </div>
                  <Typography variant="15" className="text-black">
                    {task.name} ({task.assignees.map(a => a.teamMember.name).join(', ') || 'Unassigned'})
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Typography variant="13" className="text-black italic mb-6">No assigned tasks.</Typography>
        )}
        <ActionButtonsRow>
          <StyledLink onClick={() => setShowAddTaskForm(true)} className="text-black">
            <Typography variant="15" className="text-black">ADD TASK</Typography>
          </StyledLink>
          <StyledLink onClick={() => setShowAllTasks(!showAllTasks)} className="text-black">
            <Typography variant="15" className="text-black">
              {showAllTasks ? 'HIDE HISTORY' : 'EXPAND HISTORY'}
            </Typography>
          </StyledLink>
        </ActionButtonsRow>
        {showAddTaskForm && (
          <div className="mt-4 p-4 border rounded">
            <form onSubmit={handleAddTask}>
              <input
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Task Name"
                className="border border-gray-300 rounded px-3 py-2 mb-2 w-full text-black"
              />
              <input
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                type="date"
                placeholder="Task Start"
                className="border border-gray-300 rounded px-3 py-2 mb-2 w-full text-black"
              />
              <input
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                type="date"
                placeholder="Task Deadline"
                className="border border-gray-300 rounded px-3 py-2 mb-2 w-full text-black"
              />
              <select
                value={newAssigneeId}
                onChange={(e) => setNewAssigneeId(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 mb-2 w-full text-black"
              >
                <option value="">Select Assignee</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <button type="button" onClick={addNewSubtask} className="text-black hover:underline mb-2">
                Add Subtask
              </button>
              {newSubtasks.map((sub, j) => (
                <input
                  key={j}
                  value={sub}
                  onChange={(e) => updateNewSubtask(j, e.target.value)}
                  placeholder="Subtask"
                  className="border border-gray-300 rounded px-3 py-2 mb-2 w-full text-black"
                />
              ))}
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Save Task
              </button>
            </form>
          </div>
        )}
        {selectedTask && (
          <TaskDetail 
            task={selectedTask} 
            onClose={() => setSelectedTask(null)} 
          />
        )}
      </div>

      {/* ASSIGNED TEAM MEMBERS */}
      <div>
        <UnderlinedHeader title="ASSIGNED TEAM MEMBERS" />
        {project.assignees?.length > 0 ? (
          <div className="bg-white p-4 rounded-lg [--progress-bar-height:0.4rem] [--progress-fill-height:0.2rem] [--progress-bar-width:100%] [--progress-bg-color:#d4d4d4] [--progress-fill-color:#D7FAEA] [--progress-padding:0.155rem]">
            {visibleMembers.map((member) => {
              const memberTasks = project.tasks.filter((t) => t.assignees.some((a) => a.teamMember.id === member.id));
              const progress = memberTasks.length > 0 
                ? Math.round(memberTasks.reduce((sum, t) => sum + t.progress, 0) / memberTasks.length) 
                : 0;
              return (
                <div
                  key={member.id}
                  className="cursor-pointer hover:bg-gray-50 p-3"
                  onClick={() => {}}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={member.imageUrl || "/profile-icon.jpg"}
                      alt="Profile"
                      className="w-[75px] h-[75px] rounded-full object-cover"
                    />
                    <div className="space-y-1">
                      <Typography variant="17" className="text-black">{member.name} — {member.role || 'Unknown'}</Typography>
                      <Typography variant="13" className="text-black">TASK PROGRESS: {progress}%</Typography>
                    </div>
                  </div>
                  <div className="mt-2" style={{ width: 'var(--progress-bar-width)' }}>
                    <div 
                      className="overflow-hidden bg-[var(--progress-bg-color)] rounded" 
                      style={{ height: 'var(--progress-bar-height)' }} 
                    >
                      <div
                        className="bg-[var(--progress-fill-color)] rounded"
                        style={{ 
                          width: `max(0px, calc(${progress}% - 2 * var(--progress-padding)))`,
                          height: 'var(--progress-fill-height)',
                          marginLeft: 'var(--progress-padding)',
                          marginTop: 'calc((var(--progress-bar-height) - var(--progress-fill-height)) / 2)'
                        }} 
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Typography variant="13" className="text-black italic mb-6">No assigned team members.</Typography>
        )}
        <ActionButtonsRow>
          <StyledLink onClick={() => setShowAddMemberForm(true)} className="text-black">
            <Typography variant="15" className="text-black">ADD TEAM MEMBER</Typography>
          </StyledLink>
          <StyledLink onClick={() => setShowAllMembers(!showAllMembers)} className="text-black">
            <Typography variant="15" className="text-black">
              {showAllMembers ? 'HIDE HISTORY' : 'EXPAND HISTORY'}
            </Typography>
          </StyledLink>
        </ActionButtonsRow>
        {showAddMemberForm && (
          <div className="mt-4 p-4 border rounded">
            <label className="block mb-2">Select Team Members</label>
            <select
              multiple
              value={newMemberIds}
              onChange={(e) => setNewMemberIds(Array.from(e.target.selectedOptions, (o) => o.value))}
              className="border border-gray-300 rounded px-3 py-2 w-full text-black"
            >
              {members
                .filter((m) => !project.assignees.some((a) => a.id === m.id))
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
            <button onClick={handleAddMembers} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
              Add Members
            </button>
          </div>
        )}
      </div>

      {/* ASSIGNED MATERIALS */}
      <ProjectMaterialCategory 
        materials={project.materials} 
        showAll={showAllMaterials} 
        setShowAll={setShowAllMaterials} 
        onAdd={() => setShowAddMaterialForm(true)} 
      />

      {showAddMaterialForm && (
        <div className="mt-4 p-4 border rounded">
          <input
            type="text"
            placeholder="Search materials"
            value={materialSearch}
            onChange={(e) => setMaterialSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 mb-4 w-full text-black"
          />
          <div className="flex space-x-2 mb-4">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveAddCategory(category)}
                className={`text-sm font-medium px-4 py-2 rounded-t-md transition-all ${
                  activeAddCategory === category ? 'bg-white text-black' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {category.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {allMaterials
              .filter(
                (m) =>
                  m.category === activeAddCategory &&
                  !project.materials.some((pm) => pm.id === m.id) &&
                  m.name.toLowerCase().includes(materialSearch.toLowerCase())
              )
              .map((m) => (
                <div key={m.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedMaterialIds.includes(m.id)}
                    onChange={() => toggleMaterialSelect(m.id)}
                    className="mr-2"
                  />
                  <span>{m.name} (Quantity: {m.length}m, E-Score: {m.eScore})</span>
                </div>
              ))}
          </div>
          <button onClick={handleAddMaterials} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
            Add Selected Materials
          </button>
        </div>
      )}

      {/* COMPLETION FORECAST */}
      <div>
        <UnderlinedHeader title="COMPLETION FORECAST" />
        <Typography variant="13" className="text-black mb-2">BASED ON DEADLINE, TASKS TO REALISE, AND TIME ESTIMATE TO DO SO</Typography>
        <img
          src="/growth-forecast.png"
          alt="Growth Forecast"
          className="w-full max-w-md rounded mb-4" 
        />
      </div>

      {/* RECENT NOTES */}
      <div>
        <UnderlinedHeader title="RECENT NOTES" />
        <RecentNotesTable
          notes={project.notes || []}
          currentUserId={currentUserId}
          onEdit={(note) => {
            setSelectedNote(note);
            setShowEditModal(true);
          }}
          onDelete={handleDeleteNote}
          onShowAll={() => setShowAllNotes(true)}
          onAdd={() => setShowAddModal(true)}
        />
        {showEditModal && selectedNote && (
          <EditNoteModal 
            entityType="project"
            note={selectedNote} 
            onClose={() => setShowEditModal(false)} 
            onSuccess={() => { setShowEditModal(false); refreshNotes(); }} 
          />
        )}

        {showAddModal && (
          <AddNoteModal 
            entityType="project"
            entityId={project.id} 
            onClose={() => setShowAddModal(false)} 
            onSuccess={() => { setShowAddModal(false); refreshNotes(); }} 
          />
        )}

        {showAllNotes && (
          <AllNotesModal 
            notes={project.notes || []} 
            currentUserId={currentUserId}
            onEdit={(note) => {
              setSelectedNote(note);
              setShowEditModal(true);
            }}
            onDelete={handleDeleteNote}
            onClose={() => setShowAllNotes(false)} 
          />
        )}
      </div>
    </ScrollablePanel>
  )
}