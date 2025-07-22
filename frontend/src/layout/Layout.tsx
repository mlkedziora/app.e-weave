import Sidebar from './Sidebar'
import Topbar from './Topbar'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children?: ReactNode }) {
  return (
    <>
      {/* Option 1: Fixed background (recommended for performance/simplicity - always covers full main area behind content) */}
      <div className="fixed inset-0 bg-[#ECECEC] z-[-1]" /> {/* Fixed full-screen #ECECEC background, z-[-1] to stay behind everything */}
      
      {/* Option 2: Absolute background (alternative - relative to parent, covers full but may shift on scroll; uncomment to try */}
      {/* <div className="absolute inset-0 bg-[#ECECEC] z-[-1]" /> */}
      
      {/* Option 3: Relative background (default behavior - flows with content, may not cover if content short; uncomment to try */}
      {/* <div className="relative bg-[#ECECEC] z-[-1]" style={{ height: '100vh', width: '100vw' }} /> */}
      
      <div className="flex h-screen w-screen [--sidebar-width:20%] [--main-width:80%]"> {/* Full screen, variables for widths */}
        <Sidebar className="w-[var(--sidebar-width)]" /> {/* Added width class; adjust if Sidebar handles it internally */}
        <div className="flex flex-col w-[var(--main-width)]"> {/* Fixed: added var() for proper CSS variable usage */}
          <Topbar />
          <main className="flex-1 overflow-y-auto pt-20 pl-6"> {/* Added pl-6 for left padding to move cards away from sidebar */}
            {children}
          </main>
        </div>
      </div>
    </>
  )
}