// frontend/src/components/projects/ProjectMaterialList.tsx
import Typography from '../common/Typography'

type Material = {
  id: string
  name: string
  category: string
  length: number
  eScore: number
  imageUrl?: string
}

type Props = {
  materials: Material[]
  className?: string
}

export default function ProjectMaterialList({ materials, className = '' }: Props) {
  const getFillColor = (percent: number) => {
    if (percent < 20) return '#FFC0CB'; // Pale pink
    if (percent < 30) return '#FFE4C4'; // Pale beige
    if (percent < 70) return '#D7FAEA'; // Pale blue
    return '#ceffceff'; // Pale green
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-white p-4 rounded-lg [--progress-bar-height:0.4rem] [--progress-fill-height:0.2rem] [--progress-bar-width:100%] [--progress-bg-color:#d4d4d4] [--progress-padding:0.155rem]">
        {materials.map(material => (
          <div
            key={material.id}
            className="cursor-pointer hover:bg-gray-50"
          >
            <div className="flex items-center space-x-4">
              <img
                src={material.imageUrl || "/fabric.jpg"}
                alt="Fabric"
                className="w-[75px] h-[75px] rounded-full object-cover"
              />
              <div>
                <Typography variant="17" className="text-black">{material.name}</Typography>
                <Typography variant="13" className="text-black">AVAILABLE: {material.length} m</Typography>
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <div 
                className="flex-1 overflow-hidden bg-[var(--progress-bg-color)] rounded" 
                style={{ height: 'var(--progress-bar-height)' }} 
              >
                <div
                  className="rounded"
                  style={{ 
                    backgroundColor: getFillColor(material.eScore),
                    width: `max(0px, calc(${material.eScore}% - 2 * var(--progress-padding)))`,
                    height: 'var(--progress-fill-height)',
                    marginLeft: 'var(--progress-padding)',
                    marginTop: 'calc((var(--progress-bar-height) - var(--progress-fill-height)) / 2)'
                  }} 
                ></div>
              </div>
              <Typography variant="13" className="ml-4 text-black">{material.eScore}%</Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}