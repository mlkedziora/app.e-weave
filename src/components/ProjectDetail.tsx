import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Props = {
  projectId: string
}

export function ProjectDetail({ projectId }: Props) {
  const [project, setProject] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data: proj } = await supabase.from('projects').select('*').eq('id', projectId).single()
      setProject(proj)

      const { data: projectMembers } = await supabase
        .from('project_members')
        .select('team_member_id, team_members(name, user_id)')
        .eq('project_id', projectId)

      const { data: materialHistories } = await supabase
        .from('material_histories')
        .select('material_id, team_member_id, materials(fabric_type, colour)')
        .eq('material_histories.project_id', projectId)

      if (projectMembers) setMembers(projectMembers)
      if (materialHistories) setMaterials(materialHistories)
    }

    fetchData()
  }, [projectId])

  if (!project) return <p>Loading project...</p>

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>{project.name}</h2>
      <p><strong>Deadline:</strong> {project.deadline || 'N/A'}</p>
      <p><strong>Description:</strong> {project.description}</p>

      <h3>Assigned Team Members</h3>
      <ul>
        {members.map((m) => (
          <li key={m.team_member_id}>{m.team_members?.name || m.team_members?.user_id}</li>
        ))}
      </ul>

      <h3>Materials Used</h3>
      <ul>
        {materials.map((m, index) => (
          <li key={index}>{m.materials?.fabric_type} — {m.materials?.colour}</li>
        ))}
      </ul>
    </div>
  )
}
