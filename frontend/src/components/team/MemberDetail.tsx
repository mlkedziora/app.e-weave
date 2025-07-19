// frontend/src/components/team/MemberDetail.tsx
import ScrollablePanel from '../common/ScrollablePanel' // Assuming available, as in Inventory's MaterialDetail
import EmptyPanel from '../common/EmptyPanel' // Assuming available, as in Inventory

export default function MemberDetail({ member }: { member: any }) { // Updated to receive full member object
  if (!member) {
    return <EmptyPanel>Select a member to view performance.</EmptyPanel> // Used reusable EmptyPanel, matching Inventory
  }

  const start = new Date(member.startDate).toLocaleDateString()
  const end = new Date(member.endDate).toLocaleDateString()

  return (
    <ScrollablePanel className="space-y-12"> {/* Wrapped in ScrollablePanel for scrolling and airiness, matching MaterialDetail */}
      {/* Profile Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-[3px] mb-4">INDIVIDUAL PERFORMANCE</h2> {/* Added tracking for consistency with Inventory styling */}
        <div className="flex items-center space-x-4">
          <img
            src="/profile-icon.jpg"
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="space-y-2"> {/* Added space-y-2 for better spacing */}
            <p className="text-sm text-gray-600">NAME: {member.name}</p>
            <p className="text-sm text-gray-600">Position: {member.position ?? '—'}</p>
            <p className="text-sm text-gray-600">
              Start: {start} — End: {end}
            </p>
          </div>
        </div>
      </div>

      {/* Current Task */}
      <div>
        <h3 className="text-lg font-semibold tracking-[3px] mb-4">CURRENT TASK</h3> {/* Added tracking and mb-4 */}
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
        <h3 className="text-lg font-semibold tracking-[3px] mb-4">TASK HISTORY</h3> {/* Added tracking and mb-4 */}
        {member.completedTasks?.length > 0 ? (
          <ul className="text-sm list-disc list-inside mt-2 space-y-1">
            {member.completedTasks.slice(0, 10).map((task: any, i: number) => (
              <li key={i} className="text-gray-700">
                <span className="font-medium">{task.name}</span>
                {/* {task.subtasks?.length ? (
                  <ul className="ml-4 list-disc text-xs text-gray-500 mt-1 space-y-0.5">
                    {task.subtasks.map((sub: any, j: number) => (
                      <li key={j} className="line-through">
                        {sub.name}
                      </li>
                    ))}
                  </ul>
                ) : null} */}
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
      <div>
        <h3 className="text-lg font-semibold tracking-[3px] mb-4">PERFORMANCE CHART</h3> {/* Added tracking and mb-4 */}
        <p className="text-sm text-gray-600 mb-2">TAILORED TO CONTRACT LENGTH</p> {/* Added mb-2 */}
        <img
          src="/performance-chart.png"
          alt="Performance Chart"
          className="w-full mt-2 rounded shadow"
        />
      </div>

      {/* Growth Forecast */}
      <div>
        <h3 className="text-lg font-semibold tracking-[3px] mb-4">GROWTH FORECAST</h3> {/* Added tracking and mb-4 */}
        <p className="text-sm text-gray-600 mb-2">BASED ON PREVIOUS PERFORMANCE</p> {/* Added mb-2 */}
        <img
          src="/growth-forecast.png"
          alt="Growth Forecast"
          className="w-full mt-2 rounded shadow"
        />
      </div>
    </ScrollablePanel>
  )
}