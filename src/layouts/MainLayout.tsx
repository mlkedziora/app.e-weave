import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { Link, Outlet } from 'react-router-dom'

export default function MainLayout() {
  return (
    <>
      <header className="p-4 flex justify-between border-b">
        <h1 className="text-xl font-bold">
          <Link to="/">e-weave</Link>
        </h1>
        <div>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <div className="flex">
        <nav className="w-48 p-4 border-r h-screen">
          <ul className="space-y-2">
            <li><Link to="/materials">📦 Materials</Link></li>
            <li><Link to="/projects">🛠 Projects</Link></li>
            <li><Link to="/team">👥 Team</Link></li>
          </ul>
        </nav>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </>
  )
}
