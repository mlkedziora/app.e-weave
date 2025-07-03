const mockProjects = [
  { name: 'Spring Collection', taskCount: 12, progress: 75 },
  { name: 'Runway Capsule', taskCount: 8, progress: 40 },
  { name: 'Editorial Lookbook', taskCount: 6, progress: 90 },
]

export default function ProjectsOverview({
  onProjectClick,
}: {
  onProjectClick: (name: string) => void
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Projects Progress Overview</h2>
      {mockProjects.map((project) => (
        <div
          key={project.name}
          className="p-3 border rounded shadow-sm cursor-pointer hover:bg-gray-50 transition"
          onClick={() => onProjectClick(project.name)}
        >
          <div className="flex justify-between text-sm font-medium">
            <span>{project.name} — {project.taskCount} Tasks</span>
            <span>{project.progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded mt-1">
            <div
              className="h-2 bg-blue-500 rounded"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}
