import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTeamId } from '../hooks/useTeamId'

export function ProjectsList() {
  const { teamId, loading } = useTeamId()
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    if (!teamId) return

    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('team_id', teamId)

      if (error) console.error('Error fetching projects:', error)
      else setProjects(data)
    }

    fetchProjects()
  }, [teamId])

  if (loading) return <p>Loading projects...</p>
  if (!teamId) return <p>No team assigned.</p>

  return (
    <div>
      <h2>Your Projects</h2>
      <ul>
        {projects.map((proj) => (
          <li key={proj.id}>
            <strong>{proj.name}</strong><br />
            <em>{proj.description}</em>
          </li>
        ))}
      </ul>
    </div>
  )
}
