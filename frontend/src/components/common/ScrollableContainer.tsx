// frontend/src/components/common/ScrollableContainer.tsx
import React from 'react'

interface ScrollableContainerProps {
  children: React.ReactNode
  className?: string // Optional additional classes (e.g., for spacing like space-y-*)
  usePadding?: boolean // Optional prop to enable left and bottom padding
}

export default function ScrollableContainer({ children, className = '', usePadding = false }: ScrollableContainerProps) {
  const innerClass = `${usePadding ? 'pl-6 pb-6' : ''} pr-2 ${className}`;
  return (
    <div className="overflow-y-auto h-full overflow-x-visible"> {/* Added overflow-x-visible to allow horizontal extensions */}
      <div className={innerClass}> {/* Inner: conditional pl-6 pb-6, pr-2 for scrollbar distance; apply custom spacing */}
        {children}
      </div>
    </div>
  )
}