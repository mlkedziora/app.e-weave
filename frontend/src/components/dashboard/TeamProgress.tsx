// TeamProgress.tsx
import { ProgressBar } from '../shared/ProgressBar'

type Member = {
  name: string
  task: string
  completion: number
}

const dummyMembers: Member[] = [
  { name: 'Alice', task: 'Cutting', completion: 80 },
  { name: 'Bob', task: 'Sewing', completion: 45 },
  { name: 'Charlie', task: 'Finishing', completion: 90 }
]

export default function TeamProgress() {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">🧑‍🤝‍🧑 Team Progress Overview</h2>
      <div className="space-y-4">
        {dummyMembers.map((member, index) => (
          <div key={index} className="p-4 bg-white rounded shadow-sm">
            <p className="font-medium">{member.name} — {member.task}</p>
            <ProgressBar percentage={member.completion} />
          </div>
        ))}
      </div>
    </section>
  )
}
