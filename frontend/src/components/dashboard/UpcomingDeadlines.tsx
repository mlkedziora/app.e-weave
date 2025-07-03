// UpcomingDeadlines.tsx
import { ProgressBar } from '../shared/ProgressBar'

type Project = {
  name: string
  deadline: string
  completion: number
}

const upcomingProjects: Project[] = [
  { name: 'Autumn Capsule', deadline: '2025-07-05', completion: 65 },
  { name: 'Lookbook Shoot', deadline: '2025-07-12', completion: 40 }
]

export default function UpcomingDeadlines() {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">📅 Nearest Project Deadlines</h2>
      <div className="space-y-4">
        {upcomingProjects.map((project, index) => (
          <div key={index} className="p-4 bg-white rounded shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium">{project.name}</p>
              <span className="text-sm text-gray-600">Due: {project.deadline}</span>
            </div>
            <ProgressBar percentage={project.completion} />
          </div>
        ))}
      </div>
    </section>
  )
}
