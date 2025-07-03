import { useEffect, useState } from 'react'
import MaterialCategories from '@/components/inventory/MaterialCategories'
import MaterialDetail from '@/components/inventory/MaterialDetail'

type Material = {
  id: string
  name: string
  category: string
  quantity: number
  supplier?: string
  composition?: string
  price?: number
  assignedTasks?: string[]
  quantityHistory?: number[]
  impactMetrics?: string
  transport?: string
  notes?: string
}

export default function Inventory() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:3000/materials') // adjust port if needed
      .then(res => res.json())
      .then(setMaterials)
      .catch(err => console.error('Failed to load materials:', err))
  }, [])

  const selected = materials.find(m => m.id === selectedMaterialId)

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Inventory</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MaterialCategories
          onMaterialClick={(id: string) => setSelectedMaterialId(id)}
          materials={materials}
        />
        {selected ? (
          <MaterialDetail material={selected} />
        ) : (
          <div className="text-gray-500 italic">Select a material to view details</div>
        )}
      </div>
    </div>
  )
}
