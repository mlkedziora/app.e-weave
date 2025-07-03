import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import {
  SignIn,
  RedirectToSignIn,
  useUser,
} from '@clerk/clerk-react'

// Layout
import Layout from './layout/Layout'

// Protected Pages
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Projects from './pages/Projects'
import Team from './pages/Team'
import AiChat from './pages/AiChat'
import AddNew from './pages/AddNew'

// Public Entry Pages
import ChooseAccess from './pages/Entry/ChooseAccess'
import RequestAccess from './pages/Entry/RequestAccess'
import PendingApproval from './pages/Entry/PendingApproval'

// 🔄 Loader Component
function Loader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-medium">Loading...</p>
    </div>
  )
}

// ✅ ProtectedRoute with full Clerk handling
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) return <Loader />
  if (!isSignedIn) return <RedirectToSignIn />

  const approved = user.publicMetadata?.approved === true
  if (!approved) return <Navigate to="/pending-approval" />

  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<ChooseAccess />} />
      <Route path="/request-access" element={<RequestAccess />} />
      <Route path="/pending-approval" element={<PendingApproval />} />

      {/* Clerk Sign-In Page */}
      <Route
        path="/sign-in/*"
        element={<SignIn routing="path" path="/sign-in" redirectUrl="/dashboard" />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Layout><Inventory /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Layout><Projects /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <Layout><Team /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-new"
        element={
          <ProtectedRoute>
            <Layout><AddNew /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-chat"
        element={
          <ProtectedRoute>
            <Layout><AiChat /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
