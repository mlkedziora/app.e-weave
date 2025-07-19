// frontend/src/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom'
import Typography from '../components/common/Typography'

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
    <aside className="w-[calc(0.85*var(--sidebar-width))] h-screen bg-white border-r p-6 flex flex-col justify-between"> {/* ✅ Increased padding */}
      <div>
        <Typography variant="20" weight="light" className="tracking-[3px] text-black mb-10">e-Weave</Typography> {/* ✅ Adjusted size close to 1rem (16px~17px), increased mb */}
        <nav className="space-y-4"> {/* ✅ Increased space-y for airiness */}
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`block px-2 py-1 rounded text-black hover:underline hover:text-gray-800 ${
                pathname === path ? 'bg-gray-100' : ''
              }`}
            >
              <Typography variant="15" className="text-black">{label}</Typography>
            </Link>
          ))}
        </nav>
      </div>
      <Typography variant="13" className="text-black">BRAND/COMPANY</Typography>
    </aside>
  )
}