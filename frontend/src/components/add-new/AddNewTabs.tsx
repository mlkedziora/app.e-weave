import { useState } from 'react'
import MaterialForm from './MaterialForm'
import ProjectForm from './ProjectForm'
import TeamMemberForm from './TeamMemberForm'

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
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex space-x-4 border-b mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-md font-semibold transition-all duration-200 ${
              activeTab === tab ? 'bg-white border-t border-l border-r' : 'bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="bg-white p-6 rounded-md shadow">{renderForm()}</div>
    </div>
  )
}