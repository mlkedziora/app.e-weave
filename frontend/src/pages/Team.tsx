import { useState } from 'react'
import TeamList from '@/components/team/TeamList'
import MemberDetail from '@/components/team/MemberDetail'

export default function Team() {
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(null)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Team</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member list */}
        <TeamList onMemberClick={(name: string) => setSelectedMemberName(name)} />

        {/* Detail viewer */}
        {selectedMemberName ? (
          <MemberDetail memberName={selectedMemberName} />
        ) : (
          <div className="text-gray-500 italic">Select a member to view performance</div>
        )}
      </div>
    </div>
  )
}
