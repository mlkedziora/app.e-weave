// frontend/src/components/common/Card.tsx (new, for non-image cards like in MaterialList)
import React, { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  onClick?: () => void
  className?: string // Optional extra classes
}

export default function Card({ children, onClick, className = '' }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-4 bg-white border rounded-lg shadow hover:shadow-md transition text-black ${className}`}
    >
      {children}
    </div>
  )
}