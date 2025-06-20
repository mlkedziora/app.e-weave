import { useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { supabase } from '../lib/supabase'

export function useInitializeTeam() {
  const { user } = useUser()

  useEffect(() => {
    if (!user) return

    const init = async () => {
      const { data: existing, error } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing || error) return

      const { data: team, error: teamErr } = await supabase
        .from('teams')
        .insert([{ name: `${user.fullName || 'Untitled'} Team` }])
        .select('id')
        .single()

      if (teamErr || !team) return

      await supabase.from('team_members').insert([
        {
          user_id: user.id,
          team_id: team.id,
          role: 'admin',
        },
      ])
    }

    init()
  }, [user])
}
