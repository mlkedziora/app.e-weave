// src/App.tsx
import {
  SignedIn,
  SignedOut,
  SignIn,
} from '@clerk/clerk-react'
import { Routes, Route } from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Projects from './pages/Projects'
import Team from './pages/Team'
import AiChat from './pages/AiChat'

export default function App() {
  return (
    <>
      <SignedIn>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/team" element={<Team />} />
            <Route path="/ai-chat" element={<AiChat />} />
          </Route>
        </Routes>
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
