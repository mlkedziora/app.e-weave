// src/pages/Inventory.tsx
import { MaterialsList } from '../components/MaterialsList'
import { MaterialForm } from '../components/MaterialForm'

export default function Inventory() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">📦 Inventory</h2>
      <p>Manage your materials and fabric stock here.</p>
      <MaterialForm />
      <MaterialsList />
    </div>
  )
}
