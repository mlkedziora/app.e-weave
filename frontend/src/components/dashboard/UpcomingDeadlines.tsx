import { useEffect, useState } from 'react'
import { ProgressBar } from '../shared/ProgressBar'

type Project = {
  name: string
  deadline: string
  progress: number
}

export default function UpcomingDeadlines() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetch('http://localhost:3000/projects')
      .then(res => res.json())
      .then(data => {
        const sorted = data
          .filter((p: any) => p.deadline)
          .map((p: any) => ({
            name: p.name,
            deadline: new Date(p.deadline).toLocaleDateString(),
            progress: p.progress ?? 0,
          }))
          .sort((a: Project, b: Project) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

        setProjects(sorted)
      })
      .catch(console.error)
  }, [])

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">📅 Nearest Project Deadlines</h2>
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div key={index} className="p-4 bg-white rounded shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium">{project.name}</p>
              <span className="text-sm text-gray-600">Due: {project.deadline}</span>
            </div>
            <ProgressBar percentage={project.progress} />
          </div>
        ))}
      </div>
    </section>
  )
}
