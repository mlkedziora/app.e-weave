import { useEffect, useState } from 'react'

interface Task {
  id: string
  name: string
  progress: number
  assignee: {
    name: string
  }
}

interface ProjectDetailData {
  name: string
  description?: string
  deadline?: string
  notes?: string
  tasks: Task[]
}

export default function ProjectDetail({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<ProjectDetailData | null>(null)

  useEffect(() => {
    fetch(`http://localhost:3000/projects/${projectId}`) // ✅ ADD BACKEND URL
      .then((res) => res.json())
      .then((data) => setProject(data))
      .catch((err) => console.error('Failed to load project:', err))
  }, [projectId])

  if (!project) {
    return <div className="p-6 text-gray-500">Loading project details...</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
      {project.description && <p className="text-gray-700 mb-2">{project.description}</p>}
      {project.deadline && <p className="text-sm text-gray-500">Deadline: {project.deadline}</p>}
      {project.notes && <p className="text-sm italic text-gray-600 mt-2">{project.notes}</p>}

      <h3 className="text-lg font-semibold mt-6 mb-2">Tasks</h3>
      <ul className="space-y-2">
        {project.tasks.map((task) => (
          <li key={task.id} className="border p-3 rounded-md shadow-sm">
            <p className="font-medium">{task.name}</p>
            <p className="text-sm text-gray-500">Assigned to: {task.assignee.name}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
