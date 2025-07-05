import { useEffect, useState } from 'react'

export default function MemberDetail({ memberName }: { memberName: string }) {
  const [member, setMember] = useState<any | null>(null)

  useEffect(() => {
    fetch('http://localhost:3000/members')
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{member.name}</h2>
      <p className="text-sm text-gray-600">Role: {member.role}</p>
      <p className="text-sm text-gray-600">Position: {member.position ?? '—'}</p>
      <p className="text-sm text-gray-600">User ID: {member.userId}</p>
      <p className="text-sm text-gray-500">
        Active: {new Date(member.startDate).toLocaleDateString()} – {new Date(member.endDate).toLocaleDateString()}
      </p>
      <p className="text-sm text-gray-700">Avg Performance Score: {member.progress}%</p>

      {/* Growth Forecast */}
      {member.growthForecasts?.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Growth Forecast</h3>
          <ul className="text-sm space-y-1 mt-1">
            {member.growthForecasts.map((gf: any, idx: number) => (
              <li key={idx} className="bg-gray-100 rounded p-2">
                <p><strong>Projected Role:</strong> {gf.projectedRole}</p>
                <p><strong>Rationale:</strong> {gf.rationale}</p>
                <p className="text-gray-500"><strong>For:</strong> {new Date(gf.forecastFor).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Material History */}
      {member.materialHistories?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Material History</h3>
          <ul className="space-y-2 mt-2">
            {member.materialHistories.map((entry: any, i: number) => (
              <li key={i} className="border p-3 rounded bg-gray-50 text-sm space-y-1">
                <div>
                  <strong>Material:</strong> {entry.material.name} ({entry.material.fiber}, {entry.material.color})
                </div>
                <div>
                  <strong>Change:</strong> {entry.deltaQuantity > 0 ? '+' : ''}{entry.deltaQuantity}m
                </div>
                <div>
                  <strong>Note:</strong> {entry.note}
                </div>
                <div className="text-gray-500">
                  <strong>Date:</strong> {new Date(entry.timestamp).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
