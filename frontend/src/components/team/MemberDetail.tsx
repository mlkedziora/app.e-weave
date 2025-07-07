import { useEffect, useState } from 'react'

export default function MemberDetail({ memberName }: { memberName: string }) {
  const [member, setMember] = useState<any | null>(null)

  useEffect(() => {
    fetch('http://localhost:3000/members') // Ensure this returns nested currentTask + completedTasks + subtasks
      .then(res => res.json())
      .then(data => {
        const match = data.find((m: any) => m.name === memberName)
        setMember(match)
      })
  }, [memberName])

  if (!member) {
    return (
      <div className="text-gray-500 italic">
        Member "{memberName}" not found in backend data.
      </div>
    )
  }

  const start = new Date(member.startDate).toLocaleDateString()
  const end = new Date(member.endDate).toLocaleDateString()

  return (
    <div className="space-y-6 p-4 max-w-3xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-center space-x-4">
        <img
          src="/profile-icon.jpg"
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold">{member.name}</h2>
          <p className="text-sm text-gray-600">Position: {member.position ?? '—'}</p>
          <p className="text-sm text-gray-600">
            Start: {start} — End: {end}
          </p>
        </div>
      </div>

      {/* Current Task */}
      <div>
        <h3 className="text-lg font-semibold">Current Task</h3>
        {member.currentTask ? (
          <>
            <p className="font-medium text-gray-800 mt-1">
              {member.currentTask.name}
            </p>
            {member.currentTask.subtasks?.length > 0 ? (
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                {member.currentTask.subtasks.map((subtask: any, i: number) => (
                  <li
                    key={i}
                    className={subtask.completed ? 'line-through text-green-600' : 'text-gray-800'}
                  >
                    {subtask.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No subtasks available.</p>
            )}
            <p className="mt-2 text-sm text-blue-600 font-semibold">
              Progress: {member.currentTask.progress}%
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500 mt-1">No current tasks have been assigned.</p>
        )}
      </div>

      {/* Task History */}
      <div>
        <h3 className="text-lg font-semibold mt-4">Task History</h3>
        {member.completedTasks?.length > 0 ? (
          <ul className="text-sm list-disc list-inside mt-2 space-y-1">
            {member.completedTasks.slice(0, 10).map((task: any, i: number) => (
              <li key={i} className="text-gray-700">
                <span className="font-medium">{task.name}</span>
                {task.subtasks?.length ? (
                  <ul className="ml-4 list-disc text-xs text-gray-500 mt-1 space-y-0.5">
                    {task.subtasks.map((sub: any, j: number) => (
                      <li key={j} className="line-through">
                        {sub.name}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 mt-1">No task history yet.</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-4">
        <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
          Assign Task
        </button>
        <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
          Expand History
        </button>
      </div>

      {/* Performance Chart */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold">Performance Chart</h3>
        <img
          src="/performance-chart.png"
          alt="Performance Chart"
          className="w-full mt-2 rounded shadow"
        />
      </div>

      {/* Growth Forecast */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold">Growth Forecast</h3>
        <img
          src="/growth-forecast.png"
          alt="Growth Forecast"
          className="w-full mt-2 rounded shadow"
        />
      </div>
    </div>
  )
}
