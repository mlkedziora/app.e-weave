// frontend/src/components/projects/ProjectsOverview.tsx
import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import ProjectCategories from './ProjectCategories'

type Project = {
  id: string
  name: string
  category: string
  progress: number
}

type Props = {
  onSelect: (id: string) => void
  selectedId: string | null
  className?: string
}

export default function ProjectsOverview({
  onSelect,
  selectedId,
  className = ''
}: Props) {
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const token = await getToken({ template: 'backend-access' })
        const res = await fetch('http://localhost:3000/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`)
        }
        const data = await res.json()
        if (!Array.isArray(data)) {
          throw new Error('Expected array but received invalid data')
        }
        // Simulate progress since backend may not provide it
        setProjects(data.map((p: any) => ({ ...p, progress: Math.floor(Math.random() * 100) + (Math.random() > 0.5 ? 0 : 100) })))
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError('Failed to load projects. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [getToken])
  if (loading) return <div className="h-full flex items-center justify-center text-black">Loading projects...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>
  if (projects.length === 0) return <div className="h-full flex items-center justify-center text-black">No projects found.</div>

  return (
    <ProjectCategories
      projects={projects}
      onProjectClick={onSelect}
      selectedId={selectedId}
    />
  )
}