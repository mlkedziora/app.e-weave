// src/App.tsx
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignInButton,
  useUser,
} from '@clerk/clerk-react'
import { useEffect } from 'react'

export default function App() {
  return (
    <>
      <SignedIn>
        <LoggedInUser />
      </SignedIn>

      <SignedOut>
        <SignIn
          routing="path"
          path="/sign-in"
          redirectUrl="/"
          appearance={{ elements: { card: 'my-custom-card-style' } }}
        />
      </SignedOut>
    </>
  )
}

function LoggedInUser() {
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      console.log('🪪 Your Clerk User ID:', user.id)
    }
  }, [user])

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold">Welcome {user?.fullName}</h2>
      <p>This is your dashboard. Use the sidebar to navigate materials, projects, and team.</p>
    </div>
  )
}
