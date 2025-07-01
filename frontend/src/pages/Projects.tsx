// src/pages/Projects.tsx
import { ProjectForm } from '../components/ProjectForm'
import { ProjectsList } from '../components/ProjectsList'
import { ProjectAssignment } from '../components/ProjectAssignment'

export default function Projects() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">🛠 Projects</h2>
      <p>View, create, and manage your team’s projects here.</p>
      <ProjectForm />
      <ProjectAssignment />
      <ProjectsList />
    </div>
  )
}
