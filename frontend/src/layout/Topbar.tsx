// src/layout/Topbar.tsx
import { SignedIn, UserButton } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

export default function Topbar() {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <button title="Toggle dark mode">🌓</button>
        <button title="Toggle fullscreen">⛶</button>
        <input
          type="text"
          placeholder="Search"
          className="border px-2 py-1 rounded"
        />
        <input type="date" className="border px-2 py-1 rounded" />
      </div>
      <div className="flex items-center gap-4">
        <button title="Notifications">🔔</button>
        <Link
          to="/dashboard"
          className="font-semibold hover:underline hover:text-blue-600 transition"
        >
          DASHBOARD
        </Link>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  )
}
