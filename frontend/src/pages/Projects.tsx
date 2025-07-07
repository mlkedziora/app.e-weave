import ProjectsOverview from '../components/projects/ProjectsOverview'
import ProjectDetail from '../components/projects/ProjectDetail'
import { useState } from 'react'

export default function Projects() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
      <div className="md:w-1/2 overflow-y-auto">
        <ProjectsOverview onSelect={setSelectedProjectId} selectedId={selectedProjectId} />
      </div>
      <div className="md:w-1/2 border-l overflow-y-auto">
        {selectedProjectId ? (
          <ProjectDetail projectId={selectedProjectId} />
        ) : (
          <div className="p-6 text-gray-500">Select a project to view details</div>
        )}
      </div>
    </div>
  )
}
