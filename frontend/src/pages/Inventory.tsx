// frontend/src/pages/Inventory.tsx
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
        const token = await getToken({ template: 'backend-access' })
        const res = await fetch('/api/materials', { // ✅ Added /api
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

  // Fetch full material details when one is clicked or refreshed
  const fetchMaterialDetails = async (id: string) => {
    setLoadingDetail(true)
    try {
      const token = await getToken({ template: 'backend-access' })
      const res = await fetch(`/api/materials/${id}?t=${Date.now()}`, { // ✅ Added /api
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error(`Failed to fetch material ${id}`)
      const data = await res.json()
      setSelectedMaterial(data)
      console.log('[Inventory] Updated selectedMaterial with fresh data:', data.length); // ✅ Log to confirm update
    } catch (err) {
      console.error('Error loading material details:', err)
      setSelectedMaterial(null)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleMaterialClick = (id: string) => {
    fetchMaterialDetails(id)
  }

  const handleRefresh = (newLength?: number) => { // ✅ Optional newLength param
    if (selectedMaterial?.id) {
      console.log('[Inventory] handleRefresh triggered for ID:', selectedMaterial.id);
      
      if (newLength !== undefined) {
        // ✅ Optimistic: Update local state immediately
        setSelectedMaterial((prev: any) => ({
          ...prev,
          length: newLength,
          history: [
            {
              teamMember: { name: 'You' }, // Mock current user
              previousLength: prev.length,
              newLength,
              changedAt: new Date().toISOString(),
            },
            ...prev.history,
          ],
        }));
      }

      fetchMaterialDetails(selectedMaterial.id); // Re-fetch to confirm/sync
    }
  }

  if (!materials) return <div className="h-full flex items-center justify-center p-4 text-black">Loading materials...</div>
  if (materials.length === 0) return <div className="h-full flex items-center justify-center p-4 text-black">No materials found.</div>


  return (
    <div className="h-full grid grid-rows-1 grid-cols-3 gap-6 p-6 overflow-hidden"> {/* ✅ Add grid-rows-1 */}
      <div className="col-span-1 h-full"> {/* ✅ Add h-full for explicitness/safety */}
        <MaterialCategories
          materials={materials}
          onMaterialClick={handleMaterialClick}
        />
      </div>

      <div className="col-span-2 h-full"> {/* ✅ Add h-full for explicitness/safety */}
        {loadingDetail ? (
          <div className="w-full bg-white p-6 rounded-lg shadow-md text-black h-full flex items-center justify-center">
            Loading material details...
          </div>
        ) : selectedMaterial ? (
          <MaterialDetail material={selectedMaterial} onRefresh={handleRefresh} />
        ) : (
          <div className="w-full bg-white p-6 rounded-lg shadow-md text-black h-full flex items-center justify-center">
            Select a material to view details
          </div>
        )}
      </div>
    </div>
  )
}