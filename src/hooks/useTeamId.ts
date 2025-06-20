// src/hooks/useTeamId.ts
import { useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useTeamId() {
  const { user } = useUser()
  const [teamId, setTeamId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchTeamId = async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Failed to fetch team ID:', error.message)
        setTeamId(null)
      } else {
        setTeamId(data.team_id)
      }

      setLoading(false)
    }

    fetchTeamId()
  }, [user])

  return { teamId, loading }
}
