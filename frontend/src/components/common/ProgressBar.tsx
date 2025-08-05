// frontend/src/components/common/ProgressBar.tsx
import React from 'react'

interface ProgressBarProps {
  progress: number; // Progress value (0-100)
  height?: string; // Outer bar height (default '0.4rem')
  fillHeight?: string; // Inner fill height (default '0.2rem')
  width?: string; // Bar width (default '100%')
  bgColor?: string; // Outer background color (default '#d4d4d4')
  fillColor?: string | ((progress: number) => string); // Inner fill color: fixed string or function based on progress (e.g., red for low, green for high)
  padding?: string; // Horizontal padding for inner fill (default '0.155rem')
  className?: string; // Additional classes for the outer div
}

export default function ProgressBar({
  progress,
  height = '0.4rem',
  fillHeight = '0.2rem',
  width = '100%',
  bgColor = '#d4d4d4',
  fillColor = '#D7FAEA', // Default to your tweaked turquoise-like green
  padding = '0.155rem',
  className = '',
}: ProgressBarProps) {
  const getFillColor = typeof fillColor === 'function' ? fillColor(progress) : fillColor;

  return (
    <div className={`mt-1 ${className}`} style={{ width }}> {/* Outer wrapper for width control */}
      <div 
        className="overflow-hidden rounded" 
        style={{ height, backgroundColor: bgColor }} 
      > {/* Outer bar: height and bg color */}
        <div
          className="rounded" // Inner fill: rounded corners
          style={{ 
            backgroundColor: getFillColor, // Dynamic or fixed fill color
            width: `max(0px, calc(${progress}% - 2 * ${padding}))`, // Adjusted for padding
            height: fillHeight, // Inner height
            marginLeft: padding, // Left padding
            marginTop: `calc((${height} - ${fillHeight}) / 2)`, // Vertical centering
          }} 
        ></div>
      </div>
    </div>
  )
}