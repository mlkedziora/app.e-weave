import { useState } from 'react'
import ProjectsOverview from '@/components/projects/ProjectsOverview'
import ProjectDetail from '@/components/projects/ProjectDetail'

export default function Projects() {
  const [selectedProjectName, setSelectedProjectName] = useState<string | null>(null)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overview list */}
        <ProjectsOverview onProjectClick={(name: string) => setSelectedProjectName(name)} />

        {/* Detail viewer */}
        {selectedProjectName ? (
          <ProjectDetail projectName={selectedProjectName} />
        ) : (
          <div className="text-gray-500 italic">Select a project to view details</div>
        )}
      </div>
    </div>
  )
}
