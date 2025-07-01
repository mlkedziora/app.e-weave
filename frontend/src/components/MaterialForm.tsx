// src/components/MaterialForm.tsx
import { useTeamId } from '../hooks/useTeamId'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function MaterialForm() {
  const { teamId } = useTeamId()

  const [form, setForm] = useState({
    fabric_type: '',
    fiber: '',
    colour: '',
    length: '',
    width: '',
    grams_per_square_meter: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamId) return alert('No team found')

    const { error } = await supabase.from('materials').insert({
      ...form,
      team_id: teamId,
      length: parseFloat(form.length),
      width: parseFloat(form.width),
      grams_per_square_meter: parseFloat(form.grams_per_square_meter),
    })

    if (error) alert(error.message)
    else {
      alert('Material added successfully')
      setForm({
        fabric_type: '',
        fiber: '',
        colour: '',
        length: '',
        width: '',
        grams_per_square_meter: '',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem', marginBottom: '2rem' }}>
      {Object.entries(form).map(([key, value]) => (
        <input
          key={key}
          name={key}
          value={value}
          placeholder={key.replace(/_/g, ' ')}
          onChange={handleChange}
          required
        />
      ))}
      <button type="submit">Add Material</button>
    </form>
  )
}
