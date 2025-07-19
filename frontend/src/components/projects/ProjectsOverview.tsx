// frontend/src/components/projects/ProjectsOverview.tsx
import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'

interface Project {
  id: string
  name: string
  taskCount?: number
  progress?: number
}

export default function ProjectsOverview({
  onSelect,
  selectedId
}: {
  onSelect: (id: string) => void
  selectedId: string | null
}) {
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true) // Added loading state for consistency
  const { getToken, isLoaded, isSignedIn } = useAuth()

  // Mirror Inventory: Extract fetch to reusable function
  const fetchProjects = async () => {
    try {
      const token = await getToken({ template: 'backend-access' })
      if (!token) {
        setError('Authentication token unavailable. Please refresh or sign in again.')
        return
      }
      const res = await fetch('/projects', {
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
      setProjects(data)
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('Failed to load projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    fetchProjects()
  }, [isLoaded, isSignedIn])

  if (!isLoaded || loading) {
    return <div className="w-full bg-white p-6 rounded-lg shadow-md text-black h-full flex items-center justify-center">Loading projects...</div> // Updated text color to black
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  if (projects.length === 0) {
    return <div className="w-full bg-white p-6 rounded-lg shadow-md text-black h-full flex items-center justify-center">No projects found.</div> // Added empty state
  }

  return (
    <div className="h-full bg-white p-4 rounded-lg shadow overflow-y-auto [--progress-bar-height:0.4rem] [--progress-fill-height:0.2rem] [--progress-bar-width:100%] [--progress-bg-color:#d4d4d4] [--progress-padding:0.155rem] [--progress-fill-color:#D7FAEA]">
      {/* CSS Variables Defined Here:
         --progress-bar-height: Sets outer (grey) bar height (0.4rem/6.4px, matches your tweak)
         --progress-fill-height: Sets inner (colored) bar height (0.2rem/3.2px, half of outer)
         --progress-bar-width: Sets bar width (100% to span card; options: 80%, 50%, 400px, etc.)
         --progress-bg-color: Sets outer bar background color (#d4d4d4, matches your tweak; options: #F0F0F0, #CCCCCC, #D3D3D3)
         --progress-padding: Sets horizontal padding for inner fill (0.155rem/2.48px, matches your tweak; options: 0.125rem/2px, 0.25rem/4px, 0 for none)
         --progress-fill-color: Sets inner bar color (#D7FAEA, matches TeamList; options: #40E0D0/turquoise, etc.)
      */}
      <h2 className="text-xl font-semibold mb-4 text-black">Projects</h2>
      <div className="space-y-4 pr-2"> {/* Kept original scroll container */}
        {projects.map((project) => {
          const taskCount = project.taskCount ?? 0
          const progress = project.progress ?? 0
          const isSelected = selectedId === project.id

          return (
            <div
              key={project.id}
              onClick={() => onSelect(project.id)}
              className={`cursor-pointer hover:bg-gray-50 ${isSelected ? '' : ''}`} // Removed bg-blue-100 to eliminate blue overlay on selection
            >
              <div className="flex items-center space-x-4">
                <img
                  src="/project.jpg" // Updated to frontend/public/project.jpg
                  alt="Project"
                  className="w-[75px] h-[75px] rounded-full object-cover" // Fixed to 75px, circular
                />
                <div>
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <p className="text-sm text-gray-600">Tasks: {taskCount}</p>
                  <p className="text-sm text-gray-500">Progress: {progress}%</p>
                </div>
              </div>
              <div className="mt-2" style={{ width: 'var(--progress-bar-width)' }}> {/* Uses --progress-bar-width */}
                <div 
                  className="overflow-hidden bg-[var(--progress-bg-color)] rounded" 
                  style={{ height: 'var(--progress-bar-height)' }} 
                > {/* Uses --progress-bg-color and --progress-bar-height */}
                  <div
                    className="rounded" // Rounded corners for inner fill
                    style={{ 
                      backgroundColor: 'var(--progress-fill-color)', // Fixed fill color matching TeamList (#D7FAEA)
                      width: `max(0px, calc(${progress}% - 2 * var(--progress-padding)))`, // Adjusted for padding
                      height: 'var(--progress-fill-height)', // Uses --progress-fill-height
                      marginLeft: 'var(--progress-padding)', // Left padding
                      marginTop: 'calc((var(--progress-bar-height) - var(--progress-fill-height)) / 2)' // Vertical centering
                    }} 
                  ></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}