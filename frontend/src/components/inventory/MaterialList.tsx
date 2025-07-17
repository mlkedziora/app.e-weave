// frontend/src/components/inventory/MaterialList.tsx
import ScrollableContainer from '../common/ScrollableContainer'
import Typography from '../common/Typography'

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
    <ScrollableContainer className="space-y-4">
      <div className="bg-white p-4 rounded-lg"> {/* ✅ Wrapping card div for uniform list look */}
        {materials.map(material => (
          <div
            key={material.id}
            onClick={() => onMaterialClick(material.id)}
            className="cursor-pointer hover:bg-gray-50" // ✅ Plain div, no border
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded" />
              <div>
                <Typography variant="17" weight="regular" className="text-black">{material.name}</Typography>
                <Typography variant="13" weight="regular" className="text-black">Quantity: {material.length}m</Typography>
                <Typography variant="13" weight="regular" className="text-black">E-Score: {Math.floor(Math.random() * 100)} / 100</Typography>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollableContainer>
  )
}