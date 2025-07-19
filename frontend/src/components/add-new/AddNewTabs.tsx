// frontend/src/components/add-new/AddNewTabs.tsx
import { useState } from 'react'
import MaterialForm from './MaterialForm'
import ProjectForm from './ProjectForm'
import TeamMemberForm from './TeamMemberForm'
import StyledLink from '../common/StyledLink'
import ScrollableContainer from '../common/ScrollableContainer'

const tabs = ['Material', 'Project', 'Team Member']

export default function AddNewTabs() {
  const [activeTab, setActiveTab] = useState('Material')

  const renderForm = () => {
    switch (activeTab) {
      case 'Material':
        return <MaterialForm />
      case 'Project':
        return <ProjectForm />
      case 'Team Member':
        return <TeamMemberForm />
      default:
        return null
    }
  }

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md text-black h-full flex flex-col overflow-hidden"> {/* ✅ Card wrapper filling full width/height, overflow-hidden to contain scroll */}
      <div className="flex space-x-6 mb-6 shrink-0"> {/* ✅ Tabs fixed, no scroll, no extra padding here as outer provides it */}
        {tabs.map(tab => (
          <StyledLink
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[15px] transition-all ${
              activeTab === tab
                ? 'text-black underline'
                : 'text-gray-500 hover:text-black hover:underline'
            }`}
          >
            {tab}
          </StyledLink>
        ))}
      </div>
      <ScrollableContainer className="space-y-6 flex-1"> {/* ✅ Scroll only here, flex-1 to fill remaining height */}
        {renderForm()}
      </ScrollableContainer>
    </div>
  )
}