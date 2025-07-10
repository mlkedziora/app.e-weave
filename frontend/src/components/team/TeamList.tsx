import { useEffect, useState } from 'react'

export default function TeamList({
  onMemberClick,
}: {
  onMemberClick: (name: string) => void
}) {
  const [members, setMembers] = useState<any[]>([])

  useEffect(() => {
    fetch('http://localhost:3000/members')
      .then(res => res.json())
      .then(setMembers)
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Team Members</h2>
      {members.map((member) => {
        const progress = member.currentTask?.progress ?? 0
        return (
          <div
            key={member.userId}
            className="p-3 border rounded shadow-sm cursor-pointer hover:bg-gray-50 transition"
            onClick={() => onMemberClick(member.name)}
          >
            <div className="flex justify-between font-medium text-sm">
              <span>{member.name} — {member.role}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded mt-1">
              <div
                className="h-2 bg-blue-500 rounded"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-blue-600 font-semibold">
              TASK PROGRESS: {progress}%
            </p>
          </div>
        )
      })}
    </div>
  )
}
