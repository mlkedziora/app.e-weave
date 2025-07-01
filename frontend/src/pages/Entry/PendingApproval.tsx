// src/pages/Entry/PendingApproval.tsx
import { SignOutButton } from '@clerk/clerk-react'

export default function PendingApproval() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <h1 className="text-2xl font-semibold">Access Pending</h1>
      <p className="text-center max-w-md text-gray-600">
        Your request has been received and is being reviewed. You’ll receive an email once your account is approved.
      </p>
      <SignOutButton>
        <button className="px-4 py-2 bg-red-500 text-white rounded">Sign Out</button>
      </SignOutButton>
    </div>
  )
}
