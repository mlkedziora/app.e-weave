// frontend/src/components/common/ListItemWithProgress.tsx
import React from 'react'
import Typography from './Typography'
import ProgressBar from './ProgressBar'

interface ListItemWithProgressProps {
  imageSrc: string; // Path to the circular image placeholder (customizable per list)
  title: string; // Main text (e.g., name — role)
  subtitle: string; // Sub text (e.g., TASK PROGRESS: {progress}%)
  progress: number; // Progress value for the bar
  onClick: () => void; // Click handler for the item
  imageSize?: string; // Image size (default '75px')
  progressProps?: Omit<React.ComponentProps<typeof ProgressBar>, 'progress'>; // Optional props to override ProgressBar (e.g., custom colors, heights)
  className?: string; // Additional classes for the item div
}

export default function ListItemWithProgress({
  imageSrc,
  title,
  subtitle,
  progress,
  onClick,
  imageSize = '75px',
  progressProps = {},
  className = '',
}: ListItemWithProgressProps) {
  return (
    <div
      className={`cursor-pointer hover:bg-gray-50 p-3 ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4"> {/* Flex structure for image and texts */}
        <img
          src={imageSrc}
          alt="Item"
          className={`w-[${imageSize}] h-[${imageSize}] rounded-full object-cover`} // Customizable image src and size
        />
        <div className="space-y-1">
          <Typography variant="17" weight="regular" className="text-black">{title}</Typography>
          <Typography variant="13" weight="regular" className="text-black">{subtitle}</Typography>
        </div>
      </div>
      <ProgressBar progress={progress} {...progressProps} /> {/* Reusable ProgressBar with optional overrides */}
    </div>
  )
}