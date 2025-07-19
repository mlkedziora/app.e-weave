// frontend/src/components/common/FullScreenPanel.tsx
import React, { ReactNode } from 'react'

interface FullScreenPanelProps {
  children: ReactNode
  className?: string // For inner div classes, e.g., 'space-y-10'
}

export default function FullScreenPanel({ children, className = '' }: FullScreenPanelProps) {
  return (
    <div className="w-full bg-white p-8 rounded-lg shadow-md text-black overflow-y-auto h-full flex-1"> {/* ✅ Full width/height, increased padding for airiness, flex-1 to fill space */}
      <div className={`pr-2 ${className}`}>
        {children}
      </div>
    </div>
  )
}