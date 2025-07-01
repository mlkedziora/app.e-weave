// src/pages/Entry/ChooseAccess.tsx
import { useNavigate } from 'react-router-dom'
import { SignOutButton, useUser } from '@clerk/clerk-react'

export default function ChooseAccess() {
  const navigate = useNavigate()
  const { isSignedIn } = useUser()

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-3xl font-bold">Welcome to E-WEAVE</h1>
      <button
        onClick={() => navigate('/sign-in')}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Log In
      </button>
      <button
        onClick={() => navigate('/request-access')}
        className="px-4 py-2 bg-gray-200 rounded"
      >
        Request Access
      </button>
      {isSignedIn && (
        <SignOutButton>
          <button className="mt-4 px-3 py-1 bg-red-500 text-white rounded">
            Sign Out
          </button>
        </SignOutButton>
      )}
    </div>
  )
}
