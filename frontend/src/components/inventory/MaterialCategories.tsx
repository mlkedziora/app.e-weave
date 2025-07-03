import { useState } from 'react'
import MaterialList from './MaterialList'

const allCategories = ['Fabrics', 'Trims', 'Fusings']

type Props = {
  onMaterialClick: (id: string) => void
  materials: any[] // refine type if needed
}

export default function MaterialCategories({ onMaterialClick, materials }: Props) {
  const [activeCategory, setActiveCategory] = useState('Fabrics')

  const filtered = materials.filter(m => m.category === activeCategory)

  return (
    <div>
      <div className="flex space-x-4 border-b pb-2 mb-4">
        {allCategories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`text-lg font-medium px-3 py-1 rounded-t-md transition-all ${
              activeCategory === category
                ? 'bg-white border border-b-white text-black'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {category.toUpperCase()}
          </button>
        ))}
      </div>
      <MaterialList materials={filtered} onMaterialClick={onMaterialClick} />
    </div>
  )
}
