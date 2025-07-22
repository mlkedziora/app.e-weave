// frontend/src/components/projects/ProjectsOverview.tsx
import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'

interface Project {
  id: string
  name: string
  taskCount?: number
  progress?: number
}

export default function ProjectsOverview({
  onSelect,
  selectedId
}: {
  onSelect: (id: string) => void
  selectedId: string | null
}) {
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { getToken, isLoaded, isSignedIn } = useAuth()

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken({ template: 'backend-access' })
      if (!token) {
        throw new Error('Authentication token unavailable. Please refresh or sign in again.')
      }
      const res = await fetch('/api/projects', {  // Added /api
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }
      const data = await res.json()
      if (!Array.isArray(data)) {
        throw new Error('Expected array but received invalid data')
      }
      setProjects(data)
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('Failed to load projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    fetchProjects()
  }, [isLoaded, isSignedIn])

  if (!isLoaded || loading) {
    return <div className="w-full bg-white p-6 rounded-lg shadow-md text-black h-full flex items-center justify-center">Loading projects...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 flex flex-col items-center">
        {error}
        <button onClick={fetchProjects} className="mt-2 text-blue-500 underline">Retry</button>
      </div>
    )
  }

  if (projects.length === 0) {
    return <div className="w-full bg-white p-6 rounded-lg shadow-md text-black h-full flex items-center justify-center">No projects found.</div>
  }

  return (
    <div className="h-full bg-white p-4 rounded-lg shadow overflow-y-auto [--progress-bar-height:0.4rem] [--progress-fill-height:0.2rem] [--progress-bar-width:100%] [--progress-bg-color:#d4d4d4] [--progress-padding:0.155rem] [--progress-fill-color:#D7FAEA]">
      <h2 className="text-xl font-semibold mb-4 text-black">Projects</h2>
      <div className="space-y-4 pr-2">
        {projects.map((project) => {
          const taskCount = project.taskCount ?? 0
          const progress = project.progress ?? 0
          const isSelected = selectedId === project.id

          return (
            <div
              key={project.id}
              onClick={() => onSelect(project.id)}
              className={`cursor-pointer hover:bg-gray-50 ${isSelected ? '' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <img
                  src="/project.jpg"
                  alt="Project"
                  className="w-[75px] h-[75px] rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <p className="text-sm text-gray-600">Tasks: {taskCount}</p>
                  <p className="text-sm text-gray-500">Progress: {progress}%</p>
                </div>
              </div>
              <div className="mt-2" style={{ width: 'var(--progress-bar-width)' }}>
                <div 
                  className="overflow-hidden bg-[var(--progress-bg-color)] rounded" 
                  style={{ height: 'var(--progress-bar-height)' }} 
                >
                  <div
                    className="rounded"
                    style={{ 
                      backgroundColor: 'var(--progress-fill-color)',
                      width: `max(0px, calc(${progress}% - 2 * var(--progress-padding)))`,
                      height: 'var(--progress-fill-height)',
                      marginLeft: 'var(--progress-padding)',
                      marginTop: 'calc((var(--progress-bar-height) - var(--progress-fill-height)) / 2)'
                    }} 
                  ></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}