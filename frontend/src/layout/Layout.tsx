// frontend/src/layout/Layout.tsx
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex h-screen w-screen [--sidebar-width:20%] [--main-width:80%]"> {/* Full screen, variables for widths */}
      <Sidebar />
      <div className="flex flex-col w-[--main-width] bg-[#ECECEC]"> {/* Full height/width fill */}
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 pt-20 bg-[#ECECEC]"> {/* Ensure background fill, pt-20 for topbar */}
          {children}
        </main>
      </div>
    </div>
  )
}