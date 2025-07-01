// src/components/MaterialsList.tsx
import { useTeamId } from '../hooks/useTeamId'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function MaterialsList() {
  const { teamId, loading } = useTeamId()
  const [materials, setMaterials] = useState<any[]>([])

  useEffect(() => {
    if (!teamId) return

    const fetchMaterials = async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('team_id', teamId)

      if (error) console.error('Error loading materials:', error)
      else setMaterials(data)
    }

    fetchMaterials()
  }, [teamId])

  if (loading) return <p>Loading team materials...</p>
  if (!teamId) return <p>No team found for your account.</p>

  return (
    <ul>
      {materials.map((mat) => (
        <li key={mat.id}>{mat.fabric_type} - {mat.colour}</li>
      ))}
    </ul>
  )
}
