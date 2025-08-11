// frontend/src/layout/Topbar.tsx
import { SignedIn, UserButton } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import Typography from '../components/common/Typography'

export default function Topbar() {
  return (
    <header className="relative flex justify-between items-center bg-transparent z-50 fixed w-[--main-width] py-4 px-6">
      <div className="flex items-center gap-4">
        <button title="Toggle dark mode">
          <img src="/night.png" alt="Dark mode" width={22} height={22} />
        </button>
        <button title="Toggle fullscreen">
          <img src="/full-screen.png" alt="Fullscreen" width={22} height={22} />
        </button>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2">
        <div className="relative w-96">
          <input
            type="text"
            placeholder="ENTER YOUR SEARCH KEY WORD"
            className="w-full h-8.5 px-4 py-2 rounded-full bg-white pr-10 text-[13px] placeholder:text-[13px] text-black placeholder:text-black outline-none focus:shadow-[0_0_10px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)]"
          />
          <img
            src="/search.png"
            alt="Search"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button title="Notifications">
          <img src="/notification.png" alt="Notifications" width={27} height={27} />
        </button>
        <Link
          to="/dashboard"
          className="text-black hover:underline hover:text-gray-800 transition"
        >
          <Typography variant="15" className="text-black">DASHBOARD</Typography>
        </Link>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  )
}