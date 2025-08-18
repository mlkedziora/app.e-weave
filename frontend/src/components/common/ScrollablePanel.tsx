// frontend/src/components/common/ScrollablePanel.tsx
import React, { ReactNode } from 'react'

interface ScrollablePanelProps {
  children: ReactNode
  className?: string // For inner div classes, e.g., 'space-y-10'
  outerClassName?: string // For outer div classes, e.g., 'mb-6 mr-6 w-[calc(100%-4.5rem)] h-[calc(100%-4.5rem)]' — adjust 'mb-6' (bottom margin, e.g., mb-4 for smaller, mb-8 for larger) and 'mr-6' (right margin, e.g., mr-4 or mr-8) to your sweet spot; update the calc values to account for margins + internal paddings (p-6 adds 1.5rem per side), e.g., for mr-4 (1rem) use w-[calc(100%-4rem)] since 1.5rem (pl) + 1.5rem (pr) + 1rem (mr) = 4rem
}

export default function ScrollablePanel({ children, className = '', outerClassName = '' }: ScrollablePanelProps) {
  return (
    <div className={`w-full bg-white p-6 rounded-lg shadow-md text-black overflow-y-auto h-full ${outerClassName}`}>
      <div className={`pr-2 ${className}`}>
        {children}
      </div>
    </div>
  )
}