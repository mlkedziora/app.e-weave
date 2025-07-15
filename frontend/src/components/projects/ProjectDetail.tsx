import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'

interface TaskAssignee {
  teamMember: {
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
}

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
  const { getToken, userId: currentUserId } = useAuth()

  useEffect(() => {
    const loadProject = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`http://localhost:3000/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`)
        }
        const data = await res.json()
        setProject(data)
      } catch (err) {
        console.error('Failed to load project:', err)
        setError('Failed to load project details. Please try again.')
      }
    }

    loadProject()
  }, [projectId])

  const refreshNotes = async () => {
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:3000/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setProject((prev) => (prev ? { ...prev, notes: data.notes } : null))
      }
    } catch (err) {
      console.error('Failed to refresh notes:', err)
    }
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  if (!project) {
    return <div className="p-6 text-gray-500">Loading project details...</div>
  }

  // Sort tasks: incomplete first
  const sortedTasks = [...project.tasks].sort((a, b) => {
    if (a.progress === 100 && b.progress < 100) return 1
    if (a.progress < 100 && b.progress === 100) return -1
    return a.progress - b.progress
  })
  const visibleTasks = showAllTasks ? sortedTasks : sortedTasks.slice(0, 10)

  // Unique assigned members with current incomplete task
  const assignedMembersMap = new Map<string, { name: string; task: string; completion: number }>()
  project.tasks.forEach((task) => {
    if (task.progress < 100) { // Only current (incomplete) tasks
      task.assignees.forEach((a) => {
        const name = a.teamMember.name
        if (!assignedMembersMap.has(name)) {
          assignedMembersMap.set(name, { name, task: task.name, completion: task.progress })
        }
      })
    }
  })
  const uniqueAssignedMembers = Array.from(assignedMembersMap.values())
  const visibleMembers = showAllMembers ? uniqueAssignedMembers : uniqueAssignedMembers.slice(0, 4)

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

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">PROJECT DETAILS</h1>
      <img src="/project.jpg" alt="Project" className="w-[50px] h-[50px] rounded object-cover" />
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
          <li key={task.id} className="flex items-center">
            <span className="mr-2">◯</span>
            {task.name} (Assigned to: {task.assignees.map(a => a.teamMember.name).join(', ') || 'Unassigned'}, Progress: {task.progress}%)
          </li>
        ))}
      </ul>
      <div className="flex gap-4">
        <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">ADD TASKS</button>
        <button
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          onClick={() => setShowAllTasks(!showAllTasks)}
        >
          {showAllTasks ? 'HIDE HISTORY' : 'EXPAND HISTORY'}
        </button>
      </div>

      <h2 className="text-2xl font-bold">ASSIGNED TEAM MEMBERS</h2>
      {visibleMembers.map((member, index) => (
        <div key={index} className="flex items-center space-x-4">
          <img src="/profile-icon.jpg" alt="Profile" className="w-[50px] h-[50px] rounded-full object-cover" />
          <div>
            <p>NAME: {member.name}</p>
            <p>TASK: {member.task}</p>
            <p>% OF COMPLETION: {member.completion}</p>
          </div>
        </div>
      ))}
      <div className="flex gap-4">
        <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">ADD TEAM MEMBER</button>
        <button
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          onClick={() => setShowAllMembers(!showAllMembers)}
        >
          {showAllMembers ? 'HIDE HISTORY' : 'EXPAND HISTORY'}
        </button>
      </div>

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
        <button
          disabled
          className="ml-auto text-sm text-gray-400 border px-3 py-2 rounded-t-md cursor-not-allowed"
        >
          +
        </button>
      </div>
      <div className="space-y-4">
        {visibleMaterials.map((material) => (
          <div key={material.id} className="flex items-center space-x-4">
            <img src="/fabric.jpg" alt="Fabric" className="w-[50px] h-[50px] rounded object-cover" />
            <div>
              <h3 className="font-semibold text-lg">PRODUCT NAME: {material.name}</h3>
              <p className="text-sm text-gray-600">QUANTITY AVAILABLE: {material.length}m</p>
              <p className="text-sm text-gray-500">E-SCORE {material.eScore} / 100</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">ADD MATERIAL</button>
        <button
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          onClick={() => setShowAllMaterials(!showAllMaterials)}
        >
          {showAllMaterials ? 'HIDE INVENTORY' : 'EXPAND INVENTORY'}
        </button>
      </div>

      <h2 className="text-2xl font-bold">COMPLETION FORECAST</h2>
      <h3 className="text-sm text-gray-500">BASED ON DEADLINE, TASKS TO REALISE, AND TIME ESTIMATE TO DO SO</h3>
      <img src="/growth-forecast.png" alt="Growth Forecast" className="w-full h-40 object-cover rounded" />

      <h2 className="text-2xl font-bold">RECENT NOTES</h2>
      {/* Omit quantity subtitle as project has no single quantity */}
      <div className="space-y-3">
        {project.notes?.slice(0, 3).map((note, i) => (
          <div key={i} className="border p-3 rounded bg-gray-50">
            <p className="text-sm text-gray-600">
              {note.teamMember?.name || 'Unknown'}
              {new Date(note.updatedAt || note.createdAt).toLocaleString()}
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
                        const res = await fetch(`http://localhost:3000/projects/notes/${note.id}`, {
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
      const res = await fetch(`http://localhost:3000/projects/notes/${note.id}`, {
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
      const res = await fetch(`http://localhost:3000/projects/${projectId}/notes`, {
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
  onSuccess: () => void // Add this to refresh after edit/delete
}

function AllNotesModal({ notes, onClose, onSuccess }: AllNotesModalProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const { getToken, userId: currentUserId } = useAuth()

  const handleDelete = async (noteId: string) => {
    if (confirm('Delete this note?')) {
      try {
        const token = await getToken({ template: 'backend-access' })
        const res = await fetch(`http://localhost:3000/projects/notes/${noteId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          throw new Error('Failed to delete')
        }
        onSuccess() // Refresh notes
      } catch (err) {
        console.error('Error deleting note:', err)
        alert('Error deleting')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md max-w-lg w-full max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">All Notes</h2>
        <div className="space-y-3">
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
        </div>
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
            onSuccess() // Refresh notes
          }}
        />
      )}
    </div>
  )
}