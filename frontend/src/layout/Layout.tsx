import Sidebar from './Sidebar'
import Topbar from './Topbar'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
