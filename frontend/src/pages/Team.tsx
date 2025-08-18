// frontend/src/pages/Team.tsx
import { useState } from 'react'
import TeamList from '@/components/team/TeamList'
import MemberDetail from '@/components/team/MemberDetail'
import SplitPanelLayout from '@/components/common/SplitPanelLayout' // Import the new component

export default function Team() {
  const [selectedMember, setSelectedMember] = useState<any | null>(null) // Updated to hold full member object

  return (
    <SplitPanelLayout
      leftContent={
        <TeamList onMemberClick={(member: any) => setSelectedMember(member)} /> // Pass full member
      }
      rightContent={
        selectedMember ? (
          <MemberDetail member={selectedMember} />
        ) : (
          <div className="w-full bg-white p-6 rounded-lg shadow-md text-black h-full flex items-center justify-center">
            Select a member to view performance
          </div>
        )
      }
    />
  )
}