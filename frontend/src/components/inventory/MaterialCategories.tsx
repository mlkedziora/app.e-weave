// frontend/src/components/inventory/MaterialCategories.tsx
import { useState } from 'react'
import MaterialList from './MaterialList'

const allCategories = ['Fabrics', 'Trims', 'Fusings']

type Material = {
  id: string
  name: string
  category: string
  length: number
}

type Props = {
  onMaterialClick: (id: string) => void
  materials: Material[]
}

export default function MaterialCategories({ onMaterialClick, materials }: Props) {
  const [activeCategory, setActiveCategory] = useState('Fabrics')
  const filtered = materials.filter(m => m.category === activeCategory)

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md text-black h-full flex flex-col overflow-hidden"> {/* Added overflow-hidden */}
      <div className="flex space-x-2 mb-4 border-b shrink-0"> {/* Added shrink-0 for fixed tabs */}
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`text-sm font-medium px-4 py-2 rounded-t-md transition-all border ${
              activeCategory === category
                ? 'bg-white text-black border-b-white'
                : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'
            }`}
          >
            {category.toUpperCase()}
          </button>
        ))}
        <button
          disabled
          className="ml-auto text-sm text-gray-400 border px-3 py-2 rounded-t-md cursor-not-allowed"
        >
          +
        </button>
      </div>

      <MaterialList materials={filtered} onMaterialClick={onMaterialClick} className="flex-1" /> {/* Added flex-1 via prop */}
    </div>
  )
}