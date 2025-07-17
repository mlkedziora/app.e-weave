// frontend/src/layout/Topbar.tsx
import { SignedIn, UserButton } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import Typography from '../components/common/Typography'

export default function Topbar() {
  return (
    <header className="flex items-center bg-transparent z-10 fixed w-[--main-width] p-4 gap-70"> {/* ✅ Use gap-[70px] or modify the arbitrary value for equal space between the three groups */}
      <div className="flex items-center gap-4">
        <button title="Toggle dark mode">
          <img src="/night.png" alt="Dark mode" width={22} height={22} />
        </button>
        <button title="Toggle fullscreen">
          <img src="/full-screen.png" alt="Fullscreen" width={22} height={22} />
        </button>
      </div>
      <div className="flex-1 flex justify-center">
        <div className="relative w-96"> {/* Adjust w-96 for width (e.g., w-80 or w-full); for height, adjust h-10 below */}
          <input
            type="text"
            placeholder="ENTER YOUR SEARCH KEY WORD"
            className="w-full h-10 py-2 rounded-full bg-white pr-10 text-black placeholder:text-black outline-none focus:shadow-[0_0_10px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)]" // ✅ Glossy effect on focus is in focus:shadow-[...]; erase this part if not liked
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