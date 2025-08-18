// frontend/src/components/inventory/MaterialCategories.tsx
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'
import MaterialList from './MaterialList'
import AddCategoryPanel from './AddCategoryPanel'
import AddMaterialPanel from './AddMaterialPanel'
import DeleteCategoryConfirm from './DeleteCategoryConfirm'
import StyledLink from '../common/StyledLink'
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
  onMaterialClick: (id: string) => void
  materials: Material[]
  onRefresh: () => void
}

export default function MaterialCategories({ onMaterialClick, materials, onRefresh }: Props) {
  const { getToken } = useAuth()
  const [realCategories, setRealCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [showAddOptions, setShowAddOptions] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddMaterial, setShowAddMaterial] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await getToken()
        const res = await fetch('/api/materials/categories', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch categories')
        const data: Category[] = await res.json()
        setRealCategories(data)
        if (data.length > 0) {
          setActiveCategory(data[0].name)
        }
      } catch (err) {
        setError('Failed to load categories')
      }
    }
    fetchCategories()
  }, [getToken])

  const hasUncategorized = materials.some(m => m.category === '')

  const effectiveCategories: Category[] = [
    ...realCategories,
    ...(hasUncategorized ? [{ id: 'uncategorized', name: 'Uncategorized' }] : []),
  ]

  useEffect(() => {
    if (effectiveCategories.length > 0 && !effectiveCategories.some(cat => cat.name === activeCategory)) {
      setActiveCategory(effectiveCategories[0].name)
    }
  }, [effectiveCategories, activeCategory])

  const handleCategoryAdded = (newCat: Category) => {
    setRealCategories([...realCategories, newCat])
    setActiveCategory(newCat.name)
  }

  const handleMaterialAdded = () => {
    setShowAddMaterial(false)
  }

  const handleAddCategoryClick = () => {
    setShowAddOptions(false)
    setShowAddCategory(true)
  }

  const handleAddMaterialClick = () => {
    setShowAddOptions(false)
    setShowAddMaterial(true)
  }

  const handleDeleteClick = (id: string) => {
    if (id === 'uncategorized') return
    setDeleteCategoryId(id)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteCategoryId) return
    try {
      const token = await getToken()
      const res = await fetch(`/api/materials/categories/${deleteCategoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const deletedCat = realCategories.find(cat => cat.id === deleteCategoryId)
        const newRealCategories = realCategories.filter(cat => cat.id !== deleteCategoryId)
        setRealCategories(newRealCategories)
        if (deletedCat && activeCategory === deletedCat.name) {
          setActiveCategory(newRealCategories[0]?.name || (hasUncategorized ? 'Uncategorized' : ''))
        }
        setShowDeleteConfirm(false)
        setDeleteCategoryId(null)
        onRefresh()
      } else {
        setError('Failed to delete category')
      }
    } catch (err) {
      setError('Error deleting category')
    }
  }

  const activeIndex = effectiveCategories.findIndex(cat => cat.name === activeCategory)
  const filtered = activeCategory === 'Uncategorized'
    ? materials.filter(m => m.category === '')
    : materials.filter(m => m.category === activeCategory)

  // ======= TUNABLES =======
  const SHEET_HEIGHT_PX   = 36   // Header height; no vertical padding used
  const SHEET_OVERLAP_PX  = 20   // How much each category underlaps the previous one
  const SHEET_GAP_PX      = 20    // Visual gap between categories (try 4..12). Net left margin = GAP - OVERLAP
  const UNDERLAP_WIDTH_PX = 2000 // How far left each sheet's "paint" extends under earlier sheets
  const LETTER_SPACING = '0.1em' // Space between letters in category names
  const TAB_PADDING_LEFT = '2rem' // Padding on the left of each category text
  const TAB_PADDING_RIGHT = '3rem' // Padding on the right of each category text (increase to push the curve further right)
  const SCROLL_AMOUNT = 200
  // ========================

  const maxDist = Math.max(activeIndex, effectiveCategories.length - 1 - activeIndex)

  const getBgForDist = (dist: number, maxDist: number) => {
    if (maxDist === 0) return '#FFFFFF'
    const factor = dist / maxDist
    const start = 255
    const end = 169
    const value = Math.round(start - (start - end) * factor)
    return `rgb(${value},${value},${value})`
  }

  const isDarkForDist = (dist: number, maxDist: number) => {
    if (maxDist === 0) return false
    const factor = dist / maxDist
    const start = 255
    const end = 169
    const value = Math.round(start - (start - end) * factor)
    return value < 180
  }

  // Utility area (right side) background. It will be clipped by the parent container's rounded corner.
  const utilityBg = '#7A7A7A'

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1) // -1 for floating point precision
    }
  }

  useEffect(() => {
    updateScrollButtons()
    const ref = scrollRef.current
    ref?.addEventListener('scroll', updateScrollButtons)
    return () => ref?.removeEventListener('scroll', updateScrollButtons)
  }, [effectiveCategories])

  useEffect(() => {
    if (scrollRef.current) {
      const activeLi = Array.from(scrollRef.current.querySelectorAll('li')).find(
        (li) => li.getAttribute('data-active') === 'true'
      )
      activeLi?.scrollIntoView({ behavior: 'smooth', inline: 'nearest' })
    }
  }, [activeCategory])

  const handleScrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' })
  }

  const handleScrollRight = () => {
    scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' })
  }

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md text-black h-full flex flex-col overflow-hidden">
      {/* Header: clip children to match the card's exact top-right radius */}
      <div className="-mx-4 -mt-4 border-b border-gray-300 shrink-0 rounded-t-lg">
        {/* Fixed height, no vertical padding */}
        <div className="relative flex items-stretch" style={{ height: SHEET_HEIGHT_PX }}>
          <div
            ref={scrollRef}
            className="flex-grow overflow-x-auto flex items-stretch"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              backgroundColor: utilityBg,
            }}
          >
            <style>{`
              div[ref="scrollRef"]::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <ul className="relative flex items-stretch">
              {effectiveCategories.map((cat, index) => {
                const dist = Math.abs(index - activeIndex)
                const bg = getBgForDist(dist, maxDist)
                const textClass = isDarkForDist(dist, maxDist) ? 'text-white' : 'text-black'
                // Net offset between tabs
                const netLeft = index === 0 ? 0 : (SHEET_GAP_PX - SHEET_OVERLAP_PX)
                // Higher z-index for left-most, so it sits visually on top
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
                      // No vertical padding; use fixed height + flex centering
                      style={{
                        backgroundColor: bg,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: TAB_PADDING_LEFT,
                        paddingRight: '1rem',
                        borderTopLeftRadius: index === 0 ? '0.5rem' : '0',
                        borderTopRightRadius: '4rem',
                        letterSpacing: LETTER_SPACING,
                      }}
                    >
                      {cat.name}
                      {cat.id !== 'uncategorized' && <span onClick={() => handleDeleteClick(cat.id)} className="ml-2 cursor-pointer">×</span>}
                      {/* Underlap paint extending left under earlier sheets */}
                      {index > 0 && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 right-full block"
                          style={{
                            width: UNDERLAP_WIDTH_PX,
                            backgroundColor: bg,
                            zIndex: -1, // sits under this sheet (and thus under earlier ones due to their higher z-index)
                          }}
                        />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Right utility area: fills remaining width; sits UNDER the last category.
              No inner rounding — parent clipping gives the exact card curve. */}
          <div
            className="relative flex items-center justify-end gap-3 rounded-tr-lg"
            style={{
              backgroundColor: utilityBg,
              // no border radius here; parent container clips to exact card curve
              // no vertical padding, only a little horizontal breathing room if desired:
              paddingInline: '0.75rem',
              height: '100%',
              minWidth: 'fit-content',
            }}
          >
            {/* Underlap paint so this dark strip runs beneath the last category */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-full block"
              style={{
                width: UNDERLAP_WIDTH_PX,
                backgroundColor: utilityBg,
                zIndex: -1,
              }}
            />

            {/* Scroll arrows if needed */}
            {canScrollLeft && (
              <button onClick={handleScrollLeft} className="text-white text-xl select-none">
                &lt;
              </button>
            )}
            {canScrollRight && (
              <button onClick={handleScrollRight} className="text-white text-xl select-none">
                &gt;
              </button>
            )}

            {/* Icons: no extra height; no box around "+" */}
            <img src="/search.png" alt="Search" className="w-[20px] h-[20px] invert" />
            <button 
              onClick={() => setShowAddOptions(!showAddOptions)} 
              className="text-white text-xl select-none"
            >
              +
            </button>
            {showAddOptions && (
              <div className="absolute top-full right-0 bg-[#7A7A7A] shadow-lg rounded-tl-none rounded-tr-none rounded-br-none rounded-bl-md p-2 z-10 text-white w-38 space-y-2">
                <StyledLink 
                  onClick={handleAddCategoryClick} 
                  className="block w-full text-left px-4 py-1"
                >
                  <Typography variant="13" weight="regular" className="text-white uppercase" style={{ letterSpacing: '0.1em' }}>ADD CATEGORY</Typography>
                </StyledLink>
                <StyledLink 
                  onClick={handleAddMaterialClick} 
                  className="block w-full text-left px-4 py-1"
                >
                  <Typography variant="13" weight="regular" className="text-white uppercase" style={{ letterSpacing: '0.1em' }}>ADD MATERIAL</Typography>
                </StyledLink>
              </div>
            )}
          </div>
        </div>
      </div>

      <MaterialList materials={filtered} onMaterialClick={onMaterialClick} className="flex-1" />

      {showAddCategory && (
        <AddCategoryPanel 
          onClose={() => setShowAddCategory(false)} 
          onCategoryAdded={handleCategoryAdded}
          materials={materials}
        />
      )}

      {showAddMaterial && (
        <AddMaterialPanel 
          onClose={() => setShowAddMaterial(false)} 
          onAdded={handleMaterialAdded}
        />
      )}

      {showDeleteConfirm && (
        <DeleteCategoryConfirm onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDeleteConfirm} />
      )}
    </div>
  )
}