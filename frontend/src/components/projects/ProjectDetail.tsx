// frontend/src/components/projects/ProjectDetail.tsx
import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import ScrollableContainer from '../common/ScrollableContainer'
import MemberItem from '../common/MemberItem'
import MaterialItem from '../common/MaterialItem'
import TaskDetail from './TaskDetail';

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

const allCategories = ['Fabrics', 'Trims', 'Fusings']

export default function ProjectDetail({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<ProjectDetailData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAllTasks, setShowAllTasks] = useState(false)
  const [showAllMembers, setShowAllMembers] = useState(false)
  const [showAllMaterials, setShowAllMaterials] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Fabrics')
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

  const visibleMembers = showAllMembers ? (project.assignees || []) : (project.assignees || []).slice(0, 4);

  const filteredMaterials = project.materials.filter((m) => m.category === activeCategory)
  const visibleMaterials = showAllMaterials ? filteredMaterials : filteredMaterials.slice(0, 5)

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

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md text-black overflow-y-auto h-full">
      <div className="space-y-8 pr-2">
        <h1 className="text-3xl font-bold">PROJECT DETAILS</h1>
        <img src="/project.jpg" alt="Project" className="max-w-[100px] max-h-[100px] w-[100px] h-[100px] rounded-full object-cover" />
        <p className="text-xl">PROJECT NAME: {project.name}</p>
        <p>TASKS COUNT: {project.tasks.length}</p>
        <p>START DATE: {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
        <p>DEADLINE: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</p>

        <h2 className="text-2xl font-bold">COMPLETION METRICS</h2>
        <h3 className="text-sm text-gray-500">PROTOTYPE - BASED ON PEFCR GUIDELINES & TEAM PERFORMANCE</h3>
        <p>E-SCORE {calculateEScore()}/100 (based on the average of all the metrics of all the materials included in the project)</p>
        <p>COMPLETION % {calculateCompletion()} (based on the average of the % of completions of all the tasks within the project, the tasks are assigned to individual members)</p>

        <h2 className="text-2xl font-bold">ASSIGNED TASKS</h2>
        <ul className="space-y-2">
          {visibleTasks.map((task) => (
            <li 
              key={task.id} 
              className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded"
              onClick={() => setSelectedTask(task)}
            >
              <span className="mr-2">◯</span>
              {task.name} (Assigned to: {task.assignees.map(a => a.teamMember.name).join(', ') || 'Unassigned'}, Progress: {task.progress}%)
            </li>
          ))}
        </ul>
        <div className="flex gap-4">
          <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800" onClick={() => setShowAddTaskForm(!showAddTaskForm)}>
            ADD TASKS
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            onClick={() => setShowAllTasks(!showAllTasks)}
          >
            {showAllTasks ? 'HIDE HISTORY' : 'EXPAND HISTORY'}
          </button>
        </div>
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

        <h2 className="text-2xl font-bold">ASSIGNED TEAM MEMBERS</h2>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg [--progress-bar-height:0.4rem] [--progress-fill-height:0.2rem] [--progress-bar-width:100%] [--progress-bg-color:#d4d4d4] [--progress-fill-color:#D7FAEA] [--progress-padding:0.155rem]">
            {visibleMembers.map((member) => {
              const memberTasks = project.tasks.filter((t) => t.assignees.some((a) => a.teamMember.id === member.id));
              const progress = memberTasks.length > 0 
                ? Math.round(memberTasks.reduce((sum, t) => sum + t.progress, 0) / memberTasks.length) 
                : 0;
              return (
                <MemberItem
                  key={member.id}
                  name={member.name}
                  role={member.role || 'Unknown'}
                  progress={progress}
                  onClick={() => {}}  // Add if needed
                  imageUrl={member.imageUrl}
                />
              );
            })}
          </div>
        </div>
        <div className="flex gap-4">
          <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800" onClick={() => setShowAddMemberForm(!showAddMemberForm)}>
            ADD TEAM MEMBER
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            onClick={() => setShowAllMembers(!showAllMembers)}
          >
            {showAllMembers ? 'HIDE HISTORY' : 'EXPAND HISTORY'}
          </button>
        </div>
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

        <h2 className="text-2xl font-bold">FABRICS / TRIMS / FUSING / +</h2>
        <div className="flex space-x-2 mb-4 border-b">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`text-sm font-medium px-4 py-2 rounded-t-md transition-all border ${
                activeCategory === category
                  ? 'bg-white text-black border-b-white'
                  : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'
              }`}
            >
              {category.toUpperCase()}
            </button>
          ))}
          <img src="/search.png" alt="Search" className="ml-auto w-[30px] h-[30px]" />
          <button
            disabled
            className="text-sm text-gray-400 border px-3 py-2 rounded-t-md cursor-not-allowed"
          >
            +
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg [--progress-bar-height:0.4rem] [--progress-fill-height:0.2rem] [--progress-bar-width:100%] [--progress-bg-color:#d4d4d4] [--progress-padding:0.155rem]">
            {visibleMaterials.map((material) => (
              <MaterialItem
                key={material.id}
                name={material.name}
                length={material.length}
                eScore={material.eScore}
                onClick={() => {}}
                imageUrl={material.imageUrl}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800" onClick={() => setShowAddMaterialForm(!showAddMaterialForm)}>
            ADD MATERIAL
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            onClick={() => setShowAllMaterials(!showAllMaterials)}
          >
            {showAllMaterials ? 'HIDE INVENTORY' : 'EXPAND INVENTORY'}
          </button>
        </div>
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

        <h2 className="text-2xl font-bold">COMPLETION FORECAST</h2>
        <h3 className="text-sm text-gray-500">BASED ON DEADLINE, TASKS TO REALISE, AND TIME ESTIMATE TO DO SO</h3>
        <img src="/growth-forecast.png" alt="Growth Forecast" className="w-full h-40 object-cover rounded" />

        <h2 className="text-2xl font-bold">RECENT NOTES</h2>
        <div className="space-y-3">
          {project.notes?.slice(0, 3).map((note, i) => (
            <div key={i} className="border p-3 rounded bg-gray-50">
              <p className="text-sm text-gray-600">
                {note.teamMember?.name || 'Unknown'} – {new Date(note.updatedAt || note.createdAt).toLocaleString()}
              </p>
              <p>{note.content}</p>
              {note.teamMember?.userId === currentUserId && (
                <div className="mt-1 flex gap-2">
                  <button
                    className="text-xs underline text-blue-600"
                    onClick={() => {
                      setSelectedNote(note)
                      setShowEditModal(true)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs underline text-red-500"
                    onClick={async () => {
                      if (confirm('Delete this note?')) {
                        try {
                          const token = await getToken({ template: 'backend-access' })
                          const res = await fetch(`/api/projects/notes/${note.id}`, {  
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                          })
                          if (!res.ok) {
                            throw new Error('Failed to delete')
                          }
                          refreshNotes()
                        } catch (err) {
                          console.error('Error deleting note:', err)
                          alert('Error deleting')
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          <button
            className="mt-3 px-3 py-1 border rounded text-sm"
            onClick={() => setShowAddModal(true)}
          >
            Add Note
          </button>
          <button
            className="mt-3 px-3 py-1 border rounded text-sm"
            onClick={() => setShowAllNotes(true)}
          >
            EXPAND HISTORY
          </button>
        </div>

        {showEditModal && selectedNote && (
          <EditNoteModal
            note={selectedNote}
            onClose={() => setShowEditModal(false)}
            onSuccess={() => {
              setShowEditModal(false)
              refreshNotes()
            }}
          />
        )}

        {showAddModal && (
          <AddNoteModal
            projectId={project.id}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false)
              refreshNotes()
            }}
          />
        )}

        {showAllNotes && (
          <AllNotesModal notes={project.notes || []} onClose={() => setShowAllNotes(false)} onSuccess={refreshNotes} />
        )}
      </div>
    </div>
  )
}

type EditNoteModalProps = {
  note: Note
  onClose: () => void
  onSuccess: () => void
}

function EditNoteModal({ note, onClose, onSuccess }: EditNoteModalProps) {
  const [content, setContent] = useState(note.content)
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const token = await getToken({ template: 'backend-access' })
      const res = await fetch(`/api/projects/notes/${note.id}`, {  
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        throw new Error('Failed to update note')
      }
      onSuccess()
    } catch (err) {
      console.error('Error updating note:', err)
      alert('Error updating note')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-bold mb-4">Edit Note</h2>
        <textarea
          className="w-full p-2 border rounded mb-4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 border rounded" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSubmit} disabled={loading}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

type AddNoteModalProps = {
  projectId: string
  onClose: () => void
  onSuccess: () => void
}

function AddNoteModal({ projectId, onClose, onSuccess }: AddNoteModalProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()

  const handleSubmit = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      const token = await getToken({ template: 'backend-access' })
      const res = await fetch(`/api/projects/${projectId}/notes`, {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        throw new Error('Failed to add note')
      }
      onSuccess()
    } catch (err) {
      console.error('Error adding note:', err)
      alert('Error adding note')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-bold mb-4">Add Note</h2>
        <textarea
          className="w-full p-2 border rounded mb-4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note..."
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 border rounded" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSubmit} disabled={loading}>
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

type AllNotesModalProps = {
  notes: Note[]
  onClose: () => void
  onSuccess: () => void
}

function AllNotesModal({ notes, onClose, onSuccess }: AllNotesModalProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const { getToken, userId: currentUserId } = useAuth()

  const handleDelete = async (noteId: string) => {
    if (confirm('Delete this note?')) {
      try {
        const token = await getToken({ template: 'backend-access' })
        const res = await fetch(`/api/projects/notes/${noteId}`, {  
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          throw new Error('Failed to delete')
        }
        onSuccess()
      } catch (err) {
        console.error('Error deleting note:', err)
        alert('Error deleting')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md max-w-lg w-full max-h-96">
        <h2 className="text-xl font-bold mb-4">All Notes</h2>
        <ScrollableContainer className="space-y-3">
          {notes.map((note, i) => (
            <div key={i} className="border p-3 rounded bg-gray-50">
              <p className="text-sm text-gray-600">
                {note.teamMember?.name || 'Unknown'} – {new Date(note.updatedAt || note.createdAt).toLocaleString()}
              </p>
              <p>{note.content}</p>
              {note.teamMember?.userId === currentUserId && (
                <div className="mt-1 flex gap-2">
                  <button
                    className="text-xs underline text-blue-600"
                    onClick={() => {
                      setSelectedNote(note)
                      setShowEditModal(true)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs underline text-red-500"
                    onClick={() => handleDelete(note.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </ScrollableContainer>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={onClose}>
          Close
        </button>
      </div>

      {showEditModal && selectedNote && (
        <EditNoteModal
          note={selectedNote}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false)
            onSuccess()
          }}
        />
      )}
    </div>
  )
}