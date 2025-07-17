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
  const { getToken, isLoaded, isSignedIn } = useAuth()

  // Mirror Inventory: Extract fetch to reusable function
  const fetchProjects = async () => {
    try {
      const token = await getToken({ template: 'backend-access' })
      if (!token) {
        setError('Authentication token unavailable. Please refresh or sign in again.')
        return
      }
      const res = await fetch('/projects', {
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
    }
  }

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    fetchProjects()
  }, [isLoaded, isSignedIn])

  if (!isLoaded) {
    return <div className="w-full bg-white p-6 rounded-lg shadow-md text-gray-500 h-full flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  return (
    <div className="h-full bg-white p-4 rounded-lg shadow overflow-y-auto">
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
              className={`cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-100' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded" />
                <div>
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <p className="text-sm text-gray-600">Tasks: {taskCount}</p>
                  <p className="text-sm text-gray-500">Progress: {progress}%</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}