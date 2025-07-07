import { useEffect, useState } from 'react'
import { ProgressBar } from '../shared/ProgressBar'

type Member = {
  name: string
  position: string
  progress: number
}

export default function TeamProgress() {
  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    fetch('http://localhost:3000/members')
      .then(res => res.json())
      .then(data => {
        setMembers(data.map((m: any) => ({
          name: m.name,
          position: m.position,
          progress: m.progress ?? 0,
        })))
      })
      .catch(console.error)
  }, [])

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">🧑‍🤝‍🧑 Team Progress Overview</h2>
      <div className="space-y-4">
        {members.map((member, index) => (
          <div key={index} className="p-4 bg-white rounded shadow-sm">
            <p className="font-medium">{member.name} — {member.position}</p>
            <ProgressBar percentage={member.progress} />
          </div>
        ))}
      </div>
    </section>
  )
}
