import ProjectsOverview from '../components/projects/ProjectsOverview'
import ProjectDetail from '../components/projects/ProjectDetail'
import { useState } from 'react'

export default function Projects() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  return (
    <div className="h-full grid grid-rows-1 grid-cols-3 gap-6 p-6 overflow-hidden">
      <div className="col-span-1 h-full">
        <ProjectsOverview onSelect={setSelectedProjectId} selectedId={selectedProjectId} />
      </div>

      <div className="col-span-2 h-full">
        {selectedProjectId ? (
          <ProjectDetail projectId={selectedProjectId} />
        ) : (
          <div className="w-full bg-white p-6 rounded-lg shadow-md text-gray-500 h-full flex items-center justify-center">
            Select a project to view details
          </div>
        )}
      </div>
    </div>
  )
}