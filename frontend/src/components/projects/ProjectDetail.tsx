// frontend/src/components/projects/ProjectDetail.tsx

type Project = {
  name: string
  taskCount: number
  startDate: string
  endDate: string
  completion: number
  assignedTasks: string[]
  teamMembers: { name: string; task: string; progress: number }[]
  inventory: {
    fabrics: string[]
    trims: string[]
  }
  forecast: string
  notes: string[]
}

const mockProjects: Project[] = [
  {
    name: 'Spring Collection',
    taskCount: 12,
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    completion: 75,
    assignedTasks: ['Cutting', 'Sewing', 'Ironing'],
    teamMembers: [
      { name: 'Alice', task: 'Cutting', progress: 80 },
      { name: 'Bob', task: 'Sewing', progress: 50 },
    ],
    inventory: {
      fabrics: ['Silk Satin', 'Cotton Voile'],
      trims: ['Pearl Buttons'],
    },
    forecast: 'Expected to complete by March 25, 2025.',
    notes: ['Check fabric delivery ETA', 'Schedule model fittings'],
  },
  {
    name: 'Runway Capsule',
    taskCount: 8,
    startDate: '2025-02-01',
    endDate: '2025-04-10',
    completion: 40,
    assignedTasks: ['Draping', 'Finishing'],
    teamMembers: [
      { name: 'Charlie', task: 'Draping', progress: 30 },
      { name: 'Dana', task: 'Finishing', progress: 50 },
    ],
    inventory: {
      fabrics: ['Wool Crepe'],
      trims: ['Gold Zippers'],
    },
    forecast: 'Expected to complete by April 5, 2025.',
    notes: ['Secure shoot location', 'Confirm stylist'],
  },
  // Add more projects if needed
]

export default function ProjectDetail({ projectName }: { projectName: string }) {
  const project = mockProjects.find(p => p.name === projectName)

  if (!project) {
    return (
      <div className="text-gray-500 italic">
        Project "{projectName}" not found in mock data.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">{project.name}</h2>

      <div className="text-sm text-gray-600 space-y-1">
        <p><strong>Task Count:</strong> {project.taskCount}</p>
        <p><strong>Start Date:</strong> {project.startDate}</p>
        <p><strong>End Date:</strong> {project.endDate}</p>
        <p><strong>Completion:</strong> {project.completion}%</p>
        <div className="w-full h-2 bg-gray-200 rounded">
          <div
            className="h-2 bg-green-500 rounded"
            style={{ width: `${project.completion}%` }}
          ></div>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-sm mb-1">Assigned Tasks</h3>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {project.assignedTasks.map((task, idx) => (
            <li key={idx}>{task}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-medium text-sm mb-1">Assigned Team Members</h3>
        <div className="space-y-2">
          {project.teamMembers.map((member) => (
            <div key={member.name}>
              <div className="flex justify-between text-sm font-medium">
                <span>{member.name} — {member.task}</span>
                <span>{member.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-blue-400 rounded"
                  style={{ width: `${member.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-sm mb-1">Assigned Inventory</h3>
        <div className="text-sm space-y-1 text-gray-700">
          <p><strong>Fabrics:</strong> {project.inventory.fabrics.join(', ')}</p>
          <p><strong>Trims:</strong> {project.inventory.trims.join(', ')}</p>
        </div>
      </div>

      <div className="text-sm text-gray-700">
        <h3 className="font-medium mb-1">Completion Forecast</h3>
        <p>{project.forecast}</p>
      </div>

      <div>
        <h3 className="font-medium text-sm mb-1">Recent Notes</h3>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {project.notes.map((note, idx) => (
            <li key={idx}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
