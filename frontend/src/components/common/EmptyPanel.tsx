// frontend/src/components/common/EmptyPanel.tsx (new, for empty/loading states)
import React, { ReactNode } from 'react'

interface EmptyPanelProps {
  children: ReactNode
  className?: string // For additional classes, e.g., 'mb-6 mr-6 w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)]' — adjust 'mb-6' (bottom margin, e.g., mb-4 for smaller, mb-8 for larger) and 'mr-6' (right margin, e.g., mr-4 or mr-8) to your sweet spot; update the calc values accordingly (e.g., for mr-4 use w-[calc(100%-1rem)], since 4 is 1rem)
}

export default function EmptyPanel({ children, className = '' }: EmptyPanelProps) {
  return (
    <div className={`w-full bg-white p-6 rounded-lg shadow-md text-gray-500 h-full flex items-center justify-center ${className}`}>
      {children}
    </div>
  )
}