// frontend/src/components/add-new/SelectableMaterialList.tsx
import ScrollableContainer from '../common/ScrollableContainer'
import Typography from '../common/Typography'

type Material = {
  id: string
  name: string
  length: number
  category: string
  eScore: number
  imageUrl?: string
}

type Props = {
  materials: Material[]
  selected: string[]
  onSelect: (id: string) => void
  className?: string
  style?: React.CSSProperties
}

export default function SelectableMaterialList({ materials, selected, onSelect, className = '', style = {} }: Props) {
  const getFillColor = (percent: number) => {
    if (percent < 20) return '#FFC0CB'; // Pale pink
    if (percent < 30) return '#FFE4C4'; // Pale beige
    if (percent < 70) return '#D7FAEA'; // Pale blue
    return '#ceffceff'; // Pale green
  };

  return (
    <div className={`space-y-4 ${className}`} style={style}>
      {materials.map(material => (
        <div
          key={material.id}
          onClick={() => onSelect(material.id)}
          className={`cursor-pointer ${selected.includes(material.id) ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
        >
          <div className="flex items-center space-x-4">
            <img
              src={material.imageUrl || "/fabric.jpg"}
              alt="Fabric"
              className="w-[75px] h-[75px] rounded-full object-cover"
            />
            <div>
              <Typography variant="17" weight="regular" className="text-black">{material.name}</Typography>
              <Typography variant="13" weight="regular" className="text-black">AVAILABLE: {material.length} m — E-SCORE: {material.eScore}</Typography>
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <div 
              className="flex-1 overflow-hidden bg-[var(--progress-bg-color)] rounded" 
              style={{ height: 'var(--progress-bar-height)' }} 
            > {/* Uses --progress-bg-color and --progress-bar-height */}
              <div
                className="rounded" // Rounded corners for inner fill
                style={{ 
                  backgroundColor: getFillColor(material.eScore), // Dynamic fill color inspired by image
                  width: `max(0px, calc(${material.eScore}% - 2 * var(--progress-padding)))`, // Adjusted for padding, using percent as progress
                  height: 'var(--progress-fill-height)', // Uses --progress-fill-height
                  marginLeft: 'var(--progress-padding)', // Left padding
                  marginTop: 'calc((var(--progress-bar-height) - var(--progress-fill-height)) / 2)' // Vertical centering
                }} 
              ></div>
            </div>
            <Typography variant="13" weight="regular" className="ml-4 text-black">{material.eScore}</Typography>
          </div>
        </div>
      ))}
    </div>
  )
}