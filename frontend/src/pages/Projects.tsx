// frontend/src/pages/Projects.tsx
import ProjectsOverview from '../components/projects/ProjectsOverview'
import ProjectDetail from '../components/projects/ProjectDetail'
import ErrorBoundary from '../components/common/ErrorBoundary'
import { useState } from 'react'
import SplitPanelLayout from '@/components/common/SplitPanelLayout' // Import the new component

export default function Projects() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  return (
    <SplitPanelLayout
      leftContent={
        <ProjectsOverview onSelect={setSelectedProjectId} selectedId={selectedProjectId} />
      }
      rightContent={
        selectedProjectId ? (
          <ErrorBoundary>
            <ProjectDetail projectId={selectedProjectId} />
          </ErrorBoundary>
        ) : (
          <div className="w-full bg-white p-6 rounded-lg shadow-md text-gray-500 h-full flex items-center justify-center">
            Select a project to view details
          </div>
        )
      }
    />
  )
}