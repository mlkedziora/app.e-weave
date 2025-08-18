// frontend/src/components/common/SplitPanelLayout.tsx
import React, { ReactNode } from 'react'

interface SplitPanelLayoutProps {
  leftContent: ReactNode
  rightContent: ReactNode
}

export default function SplitPanelLayout({ leftContent, rightContent }: SplitPanelLayoutProps) {
  return (
    <div className="h-full grid grid-rows-1 grid-cols-3 gap-6 p-4 pt-6 pr-8.5 pb-8.5 overflow-hidden"> {/* Used arbitrary values for pr-[8.5rem] pb-[8.5rem] as per your sweet spot; adjust if needed (Tailwind supports [arbitrary] syntax) */}
      <div className="col-span-1 h-full">
        {leftContent}
      </div>
      <div className="col-span-2 h-full">
        {rightContent}
      </div>
    </div>
  )
}