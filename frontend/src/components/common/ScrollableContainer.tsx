// frontend/src/components/common/ScrollableContainer.tsx
import React from 'react'

interface ScrollableContainerProps {
  children: React.ReactNode
  className?: string // Optional additional classes (e.g., for spacing like space-y-*)
}

export default function ScrollableContainer({ children, className = '' }: ScrollableContainerProps) {
  return (
    <div className="overflow-y-auto h-full"> {/* Outer: Handles scroll */}
      <div className={`pr-2 ${className}`}> {/* Inner: pr-2 for scrollbar distance; apply custom spacing */}
        {children}
      </div>
    </div>
  )
}