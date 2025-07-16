import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react' // Import this
import ItemCard from '../common/ItemCard'

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
  const [error, setError] = useState<string | null>(null) // Add for error display
  const { getToken } = useAuth()

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const token = await getToken()
        const res = await fetch('http://localhost:3000/projects', {
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

    loadProjects()
  }, [])

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Projects</h2>
      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => {
          const taskCount = project.taskCount ?? 0
          const progress = project.progress ?? 0
          const isSelected = selectedId === project.id

          return (
            <div
              key={project.id}
              onClick={() => onSelect(project.id)}
              className={`cursor-pointer border p-4 rounded-lg shadow ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
            >
              <ItemCard imageSrc="/project.jpg" alt="Project">
                <h3 className="text-lg font-medium">{project.name}</h3>
                <p>{taskCount} tasks</p>
              </ItemCard>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-right text-sm text-gray-500 mt-1">{progress}% complete</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}