import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'

export default function TeamList({
  onMemberClick,
}: {
  onMemberClick: (name: string) => void
}) {
  const [members, setMembers] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const { getToken } = useAuth()

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const token = await getToken()
        const res = await fetch('http://localhost:3000/members', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`)
        }
        const data = await res.json()
        if (!Array.isArray(data)) {
          throw new Error('Expected array but received invalid data')
        }
        setMembers(data)
      } catch (err) {
        console.error('Error fetching members:', err)
        setError('Failed to load team members. Please try again.')
      }
    }

    loadMembers()
  }, [])

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

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