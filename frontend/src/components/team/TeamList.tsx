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
      {members.map((member) => (
        <div
          key={member.userId}
          className="p-3 border rounded shadow-sm cursor-pointer hover:bg-gray-50 transition"
          onClick={() => onMemberClick(member.name)}
        >
          <div className="flex justify-between font-medium text-sm">
            <span>{member.name} — {member.role}</span>
            <span>{member.progress ?? 0}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded mt-1">
            <div
              className="h-2 bg-blue-500 rounded"
              style={{ width: `${member.progress ?? 0}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}
