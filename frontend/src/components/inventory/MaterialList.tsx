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
  // Define dynamic fill color function (pale light red for low, pale yellow mid, pale light green for high)
  const getFillColor = (eScore: number) => {
    if (eScore < 33) return '#FFB3B3'; // Pale light red for low E-Score
    if (eScore < 66) return '#FFE4B3'; // Pale yellow/orange for medium
    return '#B3FFB3'; // Pale light green for high
  };

  return (
    <ScrollableContainer className="space-y-4">
      <div className="bg-white p-4 rounded-lg [--progress-bar-height:0.4rem] [--progress-fill-height:0.2rem] [--progress-bar-width:100%] [--progress-bg-color:#d4d4d4] [--progress-padding:0.155rem]"> {/* ✅ Wrapping card div for uniform list look; CSS vars for progress bar matching tweaks */}
        {/* CSS Variables Defined Here:
           --progress-bar-height: Sets outer (grey) bar height (0.4rem/6.4px, matches your tweak)
           --progress-fill-height: Sets inner (colored) bar height (0.2rem/3.2px, half of outer)
           --progress-bar-width: Sets bar width (100% to span card; options: 80%, 50%, 400px, etc.)
           --progress-bg-color: Sets outer bar background color (#d4d4d4, matches your tweak; options: #F0F0F0, #CCCCCC, #D3D3D3)
           --progress-padding: Sets horizontal padding for inner fill (0.155rem/2.48px, matches your tweak; options: 0.125rem/2px, 0.25rem/4px, 0 for none)
        */}
        {materials.map(material => {
          const eScore = Math.floor(Math.random() * 100); // Kept original random E-Score (0-99)
          return (
            <div
              key={material.id}
              onClick={() => onMaterialClick(material.id)}
              className="cursor-pointer hover:bg-gray-50" // ✅ Plain div, no border
            >
              <div className="flex items-center space-x-4">
                <img
                  src="/fabric.jpg" // Updated to frontend/public/fabric.jpg
                  alt="Fabric"
                  className="w-[75px] h-[75px] rounded-full object-cover" // Fixed to 75px, circular
                />
                <div>
                  <Typography variant="17" weight="regular" className="text-black">{material.name}</Typography>
                  <Typography variant="13" weight="regular" className="text-black">Quantity: {material.length}m</Typography>
                  <Typography variant="13" weight="regular" className="text-black">E-Score: {eScore} / 100</Typography>
                </div>
              </div>
              <div className="mt-2" style={{ width: 'var(--progress-bar-width)' }}> {/* Uses --progress-bar-width */}
                <div 
                  className="overflow-hidden bg-[var(--progress-bg-color)] rounded" 
                  style={{ height: 'var(--progress-bar-height)' }} 
                > {/* Uses --progress-bg-color and --progress-bar-height */}
                  <div
                    className="rounded" // Rounded corners for inner fill
                    style={{ 
                      backgroundColor: getFillColor(eScore), // Dynamic fill color: pale red to pale green
                      width: `max(0px, calc(${eScore}% - 2 * var(--progress-padding)))`, // Adjusted for padding, using eScore as progress
                      height: 'var(--progress-fill-height)', // Uses --progress-fill-height
                      marginLeft: 'var(--progress-padding)', // Left padding
                      marginTop: 'calc((var(--progress-bar-height) - var(--progress-fill-height)) / 2)' // Vertical centering
                    }} 
                  ></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollableContainer>
  )
}