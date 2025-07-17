// frontend/src/components/common/EmptyPanel.tsx (new, for empty/loading states)
import React, { ReactNode } from 'react'

interface EmptyPanelProps {
  children: ReactNode
}

export default function EmptyPanel({ children }: EmptyPanelProps) {
  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md text-gray-500 h-full flex items-center justify-center">
      {children}
    </div>
  )
}