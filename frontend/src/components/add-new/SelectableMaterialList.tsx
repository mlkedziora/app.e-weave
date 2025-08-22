// frontend/src/components/add-new/SelectableMaterialList.tsx
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
  selected: string[]
  onSelect: (id: string) => void
  className?: string
}

export default function SelectableMaterialList({ materials, selected, onSelect, className = '' }: Props) {
  return (
    <ScrollableContainer className={`space-y-4 ${className}`}>
      {materials.map(material => (
        <div
          key={material.id}
          onClick={() => onSelect(material.id)}
          className={`cursor-pointer ${selected.includes(material.id) ? 'bg-gray-200' : 'hover:bg-gray-50'}`}
        >
          <div className="flex items-center space-x-4">
            <img
              src="/fabric.jpg"
              alt="Fabric"
              className="w-[75px] h-[75px] rounded-full object-cover"
            />
            <div>
              <Typography variant="17" weight="regular" className="text-black">{material.name}</Typography>
              <Typography variant="13" weight="regular" className="text-black">AVAILABLE: {material.length} m</Typography>
            </div>
          </div>
        </div>
      ))}
    </ScrollableContainer>
  )
}