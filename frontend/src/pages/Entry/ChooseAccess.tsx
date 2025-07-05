import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUser, SignedIn, SignedOut, SignOutButton } from "@clerk/clerk-react"

export default function ChooseAccess() {
  const navigate = useNavigate()
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (!isLoaded || !user) return

    const role = user.publicMetadata?.role
    const teamId = user.publicMetadata?.teamId

    if (typeof role === "string" && typeof teamId === "string") {
      // ✅ User is approved — send to main app
      navigate("/dashboard") // ← update this path if needed
    } else {
      // ❗ User is signed in but unapproved — send to pending
      navigate("/pending-approval")
    }
  }, [isLoaded, user, navigate])

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-3xl font-bold">Welcome to E-WEAVE</h1>

      <SignedOut>
        <button
          onClick={() => navigate("/sign-in")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Log In
        </button>
        <button
          onClick={() => navigate("/request-access")}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Request Access
        </button>
      </SignedOut>

      <SignedIn>
        <SignOutButton>
          <button className="mt-4 px-3 py-1 bg-red-500 text-white rounded">
            Sign Out
          </button>
        </SignOutButton>
      </SignedIn>
    </div>
  )
}
