// frontend/src/pages/Team.tsx
import { useState } from 'react'
import TeamList from '@/components/team/TeamList'
import MemberDetail from '@/components/team/MemberDetail'

export default function Team() {
  const [selectedMember, setSelectedMember] = useState<any | null>(null) // Updated to hold full member object

  return (
    <div className="h-full grid grid-rows-1 grid-cols-3 gap-6 p-6 overflow-hidden"> {/* Matched Inventory: full height grid, cols-3, gap-6, p-6, overflow-hidden */}
      <div className="col-span-1 h-full"> {/* Left column, h-full */}
        <TeamList onMemberClick={(member: any) => setSelectedMember(member)} /> {/* Pass full member */}
      </div>

      <div className="col-span-2 h-full"> {/* Right column, h-full */}
        {selectedMember ? (
          <MemberDetail member={selectedMember} />
        ) : (
          <div className="w-full bg-white p-6 rounded-lg shadow-md text-black h-full flex items-center justify-center">
            Select a member to view performance
          </div>
        )}
      </div>
    </div>
  )
}