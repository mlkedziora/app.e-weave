import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import MaterialCategories from '../components/inventory/MaterialCategories'
import MaterialDetail from '../components/inventory/MaterialDetail'

export default function Inventory() {
  const [materials, setMaterials] = useState<any[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { getToken } = useAuth()

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const token = await getToken()
        const res = await fetch('http://localhost:3000/materials', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()
        if (Array.isArray(data)) {
          setMaterials(data)
        } else {
          console.error('Expected array, got:', data)
          setMaterials([])
        }
      } catch (err) {
        console.error('Error fetching materials:', err)
        setMaterials([])
      }
    }

    fetchMaterials()
  }, [getToken])

  if (!materials) return <div className="p-4">Loading materials...</div>
  if (materials.length === 0) return <div className="p-4 text-red-600">No materials found.</div>

  const selected = materials.find((m) => m.id === selectedId)

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      <div className="col-span-1">
        <MaterialCategories materials={materials} onMaterialClick={setSelectedId} />
      </div>
      <div className="col-span-2">
        {selected ? (
          <MaterialDetail material={selected} />
        ) : (
          <div className="text-gray-500">Select a material to view details</div>
        )}
      </div>
    </div>
  )
}
