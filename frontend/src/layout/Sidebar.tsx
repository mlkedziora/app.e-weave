// frontend/src/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/add-new', label: 'ADD NEW' },
  { path: '/inventory', label: 'INVENTORY' },
  { path: '/projects', label: 'PROJECTS' },
  { path: '/team', label: 'TEAM' },
  { path: '/ai-chat', label: 'AI-CHAT' },
]

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="w-[--sidebar-width] h-screen bg-white border-r p-4 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-8">e-Weave</h1>
        <nav className="space-y-2">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`block px-2 py-1 rounded ${
                pathname === path ? 'bg-gray-300 font-semibold' : ''
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="text-sm text-gray-600">BRAND/COMPANY</div>
    </aside>
  )
}