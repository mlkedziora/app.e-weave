import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import MaterialCategories from '../components/inventory/MaterialCategories'
import MaterialDetail from '../components/inventory/MaterialDetail'

export default function Inventory() {
  const [materials, setMaterials] = useState<any[] | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const { getToken } = useAuth()

  // Fetch material list (lightweight)
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

  // Fetch full material details when one is clicked
  const handleMaterialClick = async (id: string) => {
    setLoadingDetail(true)
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:3000/materials/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error(`Failed to fetch material ${id}`)
      const data = await res.json()
      setSelectedMaterial(data)
    } catch (err) {
      console.error('Error loading material details:', err)
      setSelectedMaterial(null)
    } finally {
      setLoadingDetail(false)
    }
  }

  if (!materials) return <div className="p-4">Loading materials...</div>
  if (materials.length === 0) return <div className="p-4 text-red-600">No materials found.</div>

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      <div className="col-span-1">
        <MaterialCategories
          materials={materials}
          onMaterialClick={handleMaterialClick}
        />
      </div>

      <div className="col-span-2">
        {loadingDetail ? (
          <div className="text-gray-500">Loading material details...</div>
        ) : selectedMaterial ? (
          <MaterialDetail material={selectedMaterial} />
        ) : (
          <div className="text-gray-500 mt-10 text-center">
            Select a material to view details
          </div>
        )}
      </div>
    </div>
  )
}
