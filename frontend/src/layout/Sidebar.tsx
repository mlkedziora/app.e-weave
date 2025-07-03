import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/inventory', label: 'INVENTORY' },
  { path: '/projects', label: 'PROJECTS' },
  { path: '/team', label: 'TEAM' },
  { path: '/ai-chat', label: 'AI-CHAT' },
  { path: '/add-new', label: 'ADD NEW' }, // ✅ New link
]

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="w-64 h-screen bg-gray-100 border-r p-4 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-8">E-WEAVE</h1>
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
      <div className="text-sm text-gray-600">ESTHER PERBANDT</div>
    </aside>
  )
}
