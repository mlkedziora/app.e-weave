// frontend/src/components/inventory/MaterialList.tsx
type Material = {
  id: string
  name: string
  length: number
  category: string
}

type Props = {
  materials: Material[]
  onMaterialClick: (id: string) => void
}

export default function MaterialList({ materials, onMaterialClick }: Props) {
  return (
    <div className="space-y-4 overflow-y-auto h-full"> {/* Internal scroll, full height */}
      {materials.map(material => (
        <div
          key={material.id}
          onClick={() => onMaterialClick(material.id)}
          className="cursor-pointer p-4 bg-white border rounded-lg shadow hover:shadow-md transition text-black"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded" />
            <div>
              <h3 className="font-semibold text-lg">{material.name}</h3>
              <p className="text-sm text-gray-600">Quantity: {material.length}m</p>
              <p className="text-sm text-gray-500">E-Score: {Math.floor(Math.random() * 100)} / 100</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}