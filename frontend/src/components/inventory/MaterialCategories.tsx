// frontend/src/components/inventory/MaterialCategories.tsx
import { useState } from 'react'
import MaterialList from './MaterialList'
import Typography from '../common/Typography'
import StyledLink from '../common/StyledLink'

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
    <div className="w-full bg-white p-8 rounded-lg shadow-md text-black h-full flex flex-col overflow-hidden"> {/* ✅ Increased padding for airiness */}
      <div className="flex space-x-6 mb-6 shrink-0"> {/* ✅ Removed border-b, increased space-x */}
        {allCategories.map((category) => (
          <StyledLink
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`text-[15px] transition-all ${
              activeCategory === category
                ? 'text-black underline'
                : 'text-gray-500 hover:text-black hover:underline'
            }`}
          >
            {category.toUpperCase()}
          </StyledLink>
        ))}
        <span
          className="ml-auto text-[15px] text-gray-400 cursor-not-allowed"
        >
          +
        </span>
      </div>

      <MaterialList materials={filtered} onMaterialClick={onMaterialClick} className="flex-1" /> {/* Added flex-1 via prop */}
    </div>
  )
}