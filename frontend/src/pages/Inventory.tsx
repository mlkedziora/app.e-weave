// frontend/src/pages/Inventory.tsx
import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import MaterialList from '../components/inventory/MaterialList'
import MaterialDetail from '../components/inventory/MaterialDetail'

export default function Inventory() {
  const [materials, setMaterials] = useState<any[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { getToken } = useAuth()

  // Secure fetch with Clerk JWT
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const token = await getToken()
        const res = await fetch('http://localhost:3000/materials', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch materials: ${res.status}`)
        }

        const data = await res.json()

        // Ensure it's an array
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
        <MaterialList materials={materials} onMaterialClick={setSelectedId} />
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
