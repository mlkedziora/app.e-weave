import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTeamId } from '../hooks/useTeamId'

export function ProjectAssignment() {
  const { teamId, loading } = useTeamId()
  const [projects, setProjects] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState('')

  useEffect(() => {
    if (!teamId) return

    const fetchData = async () => {
      const [{ data: proj }, { data: memb }, { data: mats }] = await Promise.all([
        supabase.from('projects').select('*').eq('team_id', teamId),
        supabase.from('team_members').select('*').eq('team_id', teamId),
        supabase.from('materials').select('*').eq('team_id', teamId),
      ])
      if (proj) setProjects(proj)
      if (memb) setMembers(memb)
      if (mats) setMaterials(mats)
    }

    fetchData()
  }, [teamId])

  const assign = async () => {
    if (!selectedProject || !selectedMember || !selectedMaterial) return

    const { error: projectError } = await supabase.from('project_members').insert({
      project_id: selectedProject,
      team_member_id: selectedMember,
    })

    const { error: materialError } = await supabase.from('material_histories').insert({
      material_id: selectedMaterial,
      team_member_id: selectedMember,
      previous_length: 0,
      new_length: 0,
    })

    if (projectError || materialError) {
      console.error('Error assigning:', projectError || materialError)
    } else {
      alert('Assigned!')
      setSelectedMember('')
      setSelectedMaterial('')
    }
  }

  if (loading) return <p>Loading team...</p>
  if (!teamId) return <p>No team found</p>

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Assign People & Materials to Project</h2>

      <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
        <option value="">Select project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
        <option value="">Assign member</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>{m.name || m.user_id}</option>
        ))}
      </select>

      <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)}>
        <option value="">Assign material</option>
        {materials.map((m) => (
          <option key={m.id} value={m.id}>{m.fabric_type} - {m.colour}</option>
        ))}
      </select>

      <button onClick={assign} disabled={!selectedProject || !selectedMember || !selectedMaterial}>
        Assign
      </button>
    </div>
  )
}
