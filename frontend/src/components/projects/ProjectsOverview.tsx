import { useEffect, useState } from 'react'

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

  useEffect(() => {
    fetch('http://localhost:3000/projects') // ✅ ADD BACKEND URL
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error('Error fetching projects:', err))
  }, [])

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
              className={`cursor-pointer border p-4 rounded-lg shadow ${
                isSelected ? 'bg-blue-100' : 'hover:bg-gray-50'
              }`}
            >
              <h3 className="text-lg font-medium">{project.name}</h3>
              <p>{taskCount} tasks</p>
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
