// frontend/src/layout/Layout.tsx
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children?: ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 bg-[#ECECEC] z-[-1]" />
      <div className="flex h-screen w-screen [--sidebar-width:17%] [--main-width:83%]">
        <Sidebar />
        <div className="flex flex-col w-[var(--main-width)]">
          <Topbar />
          <main className="flex-1 overflow-y-auto pt-1 pl-6 relative z-10">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}