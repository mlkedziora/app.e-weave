// frontend/src/components/projects/ProjectList.tsx
import ScrollableContainer from '../common/ScrollableContainer'
import Typography from '../common/Typography'

type Project = {
  id: string
  name: string
  category: string
  progress: number
}

type Props = {
  projects: Project[]
  onProjectClick: (id: string) => void
  selectedId: string | null
  className?: string
}

export default function ProjectList({ projects, onProjectClick, selectedId, className = '' }: Props) {
  // Define dynamic fill color function inspired by the image (pale pink for <20, pale beige for <30, pale blue for <70, pale green for >=70)
  const getFillColor = (percent: number) => {
    if (percent < 20) return '#FFC0CB'; // Pale pink
    if (percent < 30) return '#FFE4C4'; // Pale beige
    if (percent < 70) return '#D7FAEA'; // Pale blue
    return '#ceffceff'; // Pale green
  };

  return (
    <ScrollableContainer className={className}>
      <div className="bg-white p-4 rounded-lg space-y-4 [--progress-bar-height:0.4rem] [--progress-fill-height:0.2rem] [--progress-bar-width:100%] [--progress-bg-color:#d4d4d4] [--progress-padding:0.155rem]">
        {projects.map(project => {
          const percent = project.progress
          return (
            <div
              key={project.id}
              onClick={() => onProjectClick(project.id)}
              className={`cursor-pointer ${selectedId === project.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-center space-x-4">
                <img
                  src="/project.jpg" // Updated to frontend/public/project.jpg
                  alt="Project"
                  className="w-[75px] h-[75px] rounded-full object-cover" // Fixed to 75px, circular
                />
                <div>
                  <Typography variant="17" weight="regular" className="text-black">{project.name}</Typography>
                  <Typography variant="13" weight="regular" className="text-black">PROGRESS: {percent}%</Typography>
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
                      backgroundColor: getFillColor(percent), // Dynamic fill color inspired by image
                      width: `max(0px, calc(${percent}% - 2 * var(--progress-padding)))`, // Adjusted for padding, using percent as progress
                      height: 'var(--progress-fill-height)', // Uses --progress-fill-height
                      marginLeft: 'var(--progress-padding)', // Left padding
                      marginTop: 'calc((var(--progress-bar-height) - var(--progress-fill-height)) / 2)' // Vertical centering
                    }} 
                  ></div>
                </div>
                <Typography variant="13" weight="regular" className="ml-4 text-black">{percent}%</Typography>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollableContainer>
  )
}