import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from '@clerk/clerk-react'

type Props = {
  materialId: string
}

export function MaterialDetail({ materialId }: Props) {
  const [material, setMaterial] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [newLength, setNewLength] = useState('')
  const { user } = useUser()

  useEffect(() => {
    fetchMaterial()
  }, [materialId])

  const fetchMaterial = async () => {
    const { data: mat } = await supabase
      .from('materials')
      .select('*')
      .eq('id', materialId)
      .single()
    setMaterial(mat)

    const { data: hist } = await supabase
      .from('material_histories')
      .select('*, team_members(name)')
      .eq('material_id', materialId)
      .order('changed_at', { ascending: false })
    setHistory(hist)
  }

  const handleQuantityUpdate = async () => {
    if (!user || !material || !newLength) return

    const userId = user.id

    // Get team_member_id for the current user
    const { data: member } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!member) {
      alert('Team member not found.')
      return
    }

    const { error: updateError } = await supabase
      .from('materials')
      .update({ length: parseFloat(newLength), updated_at: new Date().toISOString() })
      .eq('id', material.id)

    const { error: historyError } = await supabase.from('material_histories').insert({
      material_id: material.id,
      team_member_id: member.id,
      previous_length: material.length,
      new_length: parseFloat(newLength),
      changed_at: new Date().toISOString(),
    })

    if (updateError || historyError) {
      alert('Update failed.')
      return
    }

    setNewLength('')
    fetchMaterial()
  }

  if (!material) return <p>Loading material...</p>

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>{material.fabric_type} — {material.colour}</h2>
      <p><strong>Fiber:</strong> {material.fiber}</p>
      <p><strong>Weight:</strong> {material.grams_per_square_meter} gsm</p>
      <p><strong>Size:</strong> {material.length}m x {material.width}m</p>
      <p><strong>CO₂:</strong> {material.co2} kg | <strong>Water:</strong> {material.water_usage} L | <strong>Electricity:</strong> {material.electricity_used} kWh</p>
      <p><strong>Summary:</strong> {material.summary}</p>

      <div style={{ marginTop: '2rem' }}>
        <h3>✏️ Update Quantity</h3>
        <input
          type="number"
          placeholder="New length (m)"
          value={newLength}
          onChange={(e) => setNewLength(e.target.value)}
        />
        <button onClick={handleQuantityUpdate}>Update</button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>📜 Change History</h3>
        <ul>
          {history.map((entry) => (
            <li key={entry.id}>
              {entry.team_members?.name || 'Unknown'} changed length from <strong>{entry.previous_length}</strong> → <strong>{entry.new_length}</strong> on {new Date(entry.changed_at).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
