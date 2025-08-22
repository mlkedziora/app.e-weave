// frontend/src/components/add-new/MaterialSelector.tsx
import { useState, useEffect, useRef } from 'react'
import SelectableMaterialList from './SelectableMaterialList'
import Typography from '../common/Typography'

type Material = {
  id: string
  name: string
  category: string
  length: number
}

type Category = {
  id: string
  name: string
}

type Props = {
  materials: Material[]
  selected: string[]
  onSelect: (id: string) => void
}

export default function MaterialSelector({ materials, selected, onSelect }: Props) {
  const [realCategories, setRealCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const uniqueCategories = [...new Set(materials.map(m => m.category).filter(c => c !== ''))]
    const cats: Category[] = uniqueCategories.map(name => ({ id: name, name }))
    setRealCategories(cats)

    const hasUncategorized = materials.some(m => m.category === '')
    const effectiveCategories: Category[] = [
      ...cats,
      ...(hasUncategorized ? [{ id: 'uncategorized', name: 'Uncategorized' }] : []),
    ]

    if (effectiveCategories.length > 0 && !effectiveCategories.some(cat => cat.name === activeCategory)) {
      setActiveCategory(effectiveCategories[0].name)
    }
  }, [materials, activeCategory])

  const activeIndex = realCategories.findIndex(cat => cat.name === activeCategory)
  const filtered = activeCategory === 'Uncategorized'
    ? materials.filter(m => m.category === '')
    : materials.filter(m => m.category === activeCategory)

  // ======= CATEGORY STRIP TUNABLES =======
  const SHEET_HEIGHT_PX   = 36   // header height
  const SHEET_OVERLAP_PX  = 20
  const SHEET_GAP_PX      = 20
  const UNDERLAP_WIDTH_PX = 2000
  const LETTER_SPACING = '0.1em'
  const TAB_PADDING_LEFT = '2rem'
  const TAB_PADDING_RIGHT = '3rem'
  const utilityBg = '#7A7A7A'
  const UTILITY_TOP_RIGHT_RADIUS_PX = 12
  // =======================================

  const effectiveCategories = realCategories // Use real, since uncategorized handled in useEffect

  const getBgForDist = (dist: number) => dist === 0 ? '#FFFFFF' : 'rgb(169,169,169)'

  const isDarkForDist = (dist: number) => dist > 0

  useEffect(() => {
    if (scrollRef.current) {
      const activeLi = Array.from(scrollRef.current.querySelectorAll('li')).find(li => li.getAttribute('data-active') === 'true')
      activeLi?.scrollIntoView({ behavior: 'smooth', inline: 'nearest' })
    }
  }, [activeCategory])

  return (
    <div className="w-full flex flex-col overflow-hidden border border-gray-300 rounded-lg">
      <div className="border-b border-gray-300 shrink-0 rounded-t-lg">
        <div className="relative flex items-stretch" style={{ height: SHEET_HEIGHT_PX }}>
          <div
            ref={scrollRef}
            className="flex-grow overflow-x-auto flex items-stretch"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              backgroundColor: utilityBg,
              borderTopRightRadius: `${UTILITY_TOP_RIGHT_RADIUS_PX}px`,
            }}
          >
            <style>{`
              [data-hide-scrollbar]::-webkit-scrollbar { display: none; }
            `}</style>
            <ul className="relative flex items-stretch" data-hide-scrollbar>
              {effectiveCategories.map((cat, index) => {
                const dist = Math.abs(index - activeIndex)
                const bg = getBgForDist(dist)
                const textClass = isDarkForDist(dist) ? 'text-white' : 'text-black'
                const netLeft = index === 0 ? 0 : (SHEET_GAP_PX - SHEET_OVERLAP_PX)
                const zIndex = effectiveCategories.length - index

                return (
                  <li
                    key={cat.id}
                    data-active={activeCategory === cat.name ? 'true' : 'false'}
                    className="relative shrink-0"
                    style={{ zIndex, marginLeft: netLeft }}
                  >
                    <button
                      onClick={() => setActiveCategory(cat.name)}
                      className={`relative text-[15px] font-normal uppercase ${textClass} hover:opacity-90`}
                      style={{
                        backgroundColor: bg,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: TAB_PADDING_LEFT,
                        paddingRight: TAB_PADDING_RIGHT,
                        borderTopLeftRadius: index === 0 ? '0.5rem' : '0',
                        borderTopRightRadius: '4rem',
                        letterSpacing: LETTER_SPACING,
                      }}
                    >
                      {cat.name}
                      {index > 0 && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 right-full block"
                          style={{ width: UNDERLAP_WIDTH_PX, backgroundColor: bg, zIndex: -1 }}
                        />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
      <SelectableMaterialList materials={filtered} selected={selected} onSelect={onSelect} className="flex-1" />
    </div>
  )
}