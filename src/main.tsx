// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

import MainLayout from './layouts/MainLayout'
import { MaterialsList } from './components/MaterialsList'
import { ProjectsList } from './components/ProjectsList'
// create dummy placeholders if needed:
const TeamView = () => <p>Team coming soon</p>

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) throw new Error('Missing Clerk Key')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<App />} />
            <Route path="materials" element={<MaterialsList />} />
            <Route path="projects" element={<ProjectsList />} />
            <Route path="team" element={<TeamView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
)
