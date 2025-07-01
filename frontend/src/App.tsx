import { Routes, Route, Navigate } from 'react-router-dom'
import {
  SignedIn,
  SignedOut,
  SignIn,
  RedirectToSignIn,
  useUser,
} from '@clerk/clerk-react'

import Layout from './layout/Layout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Projects from './pages/Projects'
import Team from './pages/Team'
import AiChat from './pages/AiChat'
import ChooseAccess from './pages/Entry/ChooseAccess'
import RequestAccess from './pages/Entry/RequestAccess'
import PendingApproval from './pages/Entry/PendingApproval'
import React from 'react'

function ProtectedRoute({ children }: { children: React.ReactElement }) {

  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) return null
  if (!isSignedIn) return <RedirectToSignIn />

  const approved = user.publicMetadata?.approved
  if (approved !== true) return <Navigate to="/pending-approval" />

  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<ChooseAccess />} />
      <Route path="/request-access" element={<RequestAccess />} />
      <Route path="/pending-approval" element={<PendingApproval />} />

      {/* Clerk Auth */}
      <Route
        path="/sign-in/*"
        element={
          <SignedOut>
            <SignIn routing="path" path="/sign-in" redirectUrl="/dashboard" />
          </SignedOut>
        }
      />

      {/* Protected Routes (Top-Level) */}
      <Route
        path="/dashboard"
        element={
          <SignedIn>
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          </SignedIn>
        }
      />
      <Route
        path="/inventory"
        element={
          <SignedIn>
            <ProtectedRoute>
              <Layout><Inventory /></Layout>
            </ProtectedRoute>
          </SignedIn>
        }
      />
      <Route
        path="/projects"
        element={
          <SignedIn>
            <ProtectedRoute>
              <Layout><Projects /></Layout>
            </ProtectedRoute>
          </SignedIn>
        }
      />
      <Route
        path="/team"
        element={
          <SignedIn>
            <ProtectedRoute>
              <Layout><Team /></Layout>
            </ProtectedRoute>
          </SignedIn>
        }
      />
      <Route
        path="/ai-chat"
        element={
          <SignedIn>
            <ProtectedRoute>
              <Layout><AiChat /></Layout>
            </ProtectedRoute>
          </SignedIn>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
