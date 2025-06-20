import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTeamId } from '../hooks/useTeamId'

export function ProjectForm() {
  const { teamId, loading } = useTeamId()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamId) return

    const { error } = await supabase.from('projects').insert({
      name,
      description,
      team_id: teamId,
    })

    if (error) console.error('Error creating project:', error)
    else {
      setName('')
      setDescription('')
    }
  }

  if (loading) return <p>Loading team...</p>
  if (!teamId) return <p>No team found.</p>

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h2>Create a Project</h2>
      <input
        type="text"
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <button type="submit">Create Project</button>
    </form>
  )
}
