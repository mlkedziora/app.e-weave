// frontend/src/components/common/ScrollablePanel.tsx
import React, { ReactNode } from 'react'

interface ScrollablePanelProps {
  children: ReactNode
  className?: string // For inner div classes, e.g., 'space-y-10'
}

export default function ScrollablePanel({ children, className = '' }: ScrollablePanelProps) {
  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md text-black overflow-y-auto h-full">
      <div className={`pr-2 ${className}`}>
        {children}
      </div>
    </div>
  )
}