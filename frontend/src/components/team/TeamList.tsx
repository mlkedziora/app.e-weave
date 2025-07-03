const mockMembers = [
  { name: 'Alice Johnson', task: 'Cutting', progress: 80 },
  { name: 'Bob Smith', task: 'Sewing', progress: 45 },
  { name: 'Charlie Gray', task: 'Ironing', progress: 90 },
]

export default function TeamList({
  onMemberClick,
}: {
  onMemberClick: (name: string) => void
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Team Members</h2>
      {mockMembers.map((member) => (
        <div
          key={member.name}
          className="p-3 border rounded shadow-sm cursor-pointer hover:bg-gray-50 transition"
          onClick={() => onMemberClick(member.name)}
        >
          <div className="flex justify-between font-medium text-sm">
            <span>{member.name} — {member.task}</span>
            <span>{member.progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded mt-1">
            <div
              className="h-2 bg-blue-500 rounded"
              style={{ width: `${member.progress}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}
