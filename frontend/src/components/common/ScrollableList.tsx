// frontend/src/components/common/ScrollableList.tsx
import React, { ReactNode } from 'react'
import ScrollableContainer from './ScrollableContainer' // Assuming this exists in common

interface ScrollableListProps {
  children: ReactNode; // Mapped list items (e.g., ListItemWithProgress components)
  className?: string; // Additional classes for the outer ScrollableContainer
  cardClassName?: string; // Additional classes for the inner bg-white card
}

export default function ScrollableList({
  children,
  className = '',
  cardClassName = '',
}: ScrollableListProps) {
  return (
    <ScrollableContainer className={`space-y-4 ${className}`}>
      <div className={`bg-white p-4 rounded-lg ${cardClassName}`}>
        {children} {/* Render mapped items here */}
      </div>
    </ScrollableContainer>
  )
}