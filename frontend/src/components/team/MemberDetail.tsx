const mockMembers = [
  {
    name: 'Alice Johnson',
    position: 'Seamstress',
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    currentTask: { name: 'Cutting', progress: 80 },
    taskHistory: ['Cutting', 'Sewing', 'Pressing'],
    performance: [60, 75, 80, 90],
    forecast: 'Expected to complete project in 3 days.',
  },
  {
    name: 'Bob Smith',
    position: 'Tailor',
    startDate: '2023-09-15',
    endDate: '2025-01-31',
    currentTask: { name: 'Sewing', progress: 45 },
    taskHistory: ['Sewing', 'Fitting', 'Hem Adjustments'],
    performance: [50, 55, 60, 70],
    forecast: 'Expected to complete project in 5 days.',
  },
  {
    name: 'Charlie Gray',
    position: 'Finisher',
    startDate: '2024-05-01',
    endDate: '2025-03-01',
    currentTask: { name: 'Ironing', progress: 90 },
    taskHistory: ['Ironing', 'Pressing'],
    performance: [40, 70, 90],
    forecast: 'On track for early completion.',
  },
]

export default function MemberDetail({ memberName }: { memberName: string }) {
  const member = mockMembers.find((m) => m.name === memberName)

  if (!member) {
    return (
      <div className="text-gray-500 italic">
        Member "{memberName}" not found in mock data.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{member.name}</h2>
      <div className="text-sm text-gray-600">
        <p>Position: {member.position}</p>
        <p>Start Date: {member.startDate}</p>
        <p>End Date: {member.endDate}</p>
      </div>

      <div>
        <p className="font-medium text-sm">Current Task: {member.currentTask.name}</p>
        <div className="w-full h-2 bg-gray-200 rounded mt-1">
          <div
            className="h-2 bg-green-500 rounded"
            style={{ width: `${member.currentTask.progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-right text-gray-500">{member.currentTask.progress}%</p>
      </div>

      <div>
        <p className="font-medium text-sm mb-1">Task History</p>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {member.taskHistory.map((task, idx) => (
            <li key={idx}>{task}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="font-medium text-sm mb-1">Performance Chart</p>
        <div className="flex space-x-2 items-end h-20">
          {member.performance.map((val, idx) => (
            <div key={idx} className="w-4 bg-blue-400" style={{ height: `${val}%` }}></div>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p className="font-medium">Growth Forecast:</p>
        <p>{member.forecast}</p>
      </div>
    </div>
  )
}
