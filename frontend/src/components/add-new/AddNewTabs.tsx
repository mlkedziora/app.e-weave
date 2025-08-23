// frontend/src/components/add-new/AddNewTabs.tsx
import { useState, useEffect, useRef } from 'react'
import MaterialForm from './MaterialForm'
import ProjectForm from './ProjectForm'
import TeamMemberForm from './TeamMemberForm'
import CustomerForm from './CustomerForm'
import ScrollableContainer from '../common/ScrollableContainer'
import Typography from '../common/Typography'

const tabs = ['Material', 'Project', 'Member', 'Customer']

export default function AddNewTabs() {
  const [activeTab, setActiveTab] = useState(tabs[0])

  // ======= CATEGORY STRIP TUNABLES =======
  const SHEET_HEIGHT_PX   = 36
  const SHEET_OVERLAP_PX  = 20
  const SHEET_GAP_PX      = 20
  const UNDERLAP_WIDTH_PX = 100
  const LETTER_SPACING = '0.1em'
  const TAB_PADDING_LEFT = '2rem'
  const TAB_PADDING_RIGHT = '3rem'
  const utilityBg = '#7A7A7A'
  const UTILITY_TOP_RIGHT_RADIUS_PX = 12
  // =======================================

  const scrollRef = useRef<HTMLDivElement>(null)

  const activeIndex = tabs.findIndex(tab => tab === activeTab)
  const maxDist = Math.max(activeIndex, tabs.length - 1 - activeIndex)

  const getBgForDist = (dist: number, max: number) => {
    if (max === 0) return '#FFFFFF'
    const factor = dist / max
    const start = 255
    const end = 122
    const value = Math.round(start - (start - end) * factor)
    return `rgb(${value},${value},${value})`
  }

  const isDarkForDist = (dist: number, max: number) => {
    if (max === 0) return false
    const factor = dist / max
    const start = 255
    const end = 122
    const value = Math.round(start - (start - end) * factor)
    return value < 180
  }

  useEffect(() => {
    if (scrollRef.current) {
      const activeLi = Array.from(scrollRef.current.querySelectorAll('li')).find(
        (li) => li.getAttribute('data-active') === 'true'
      )
      activeLi?.scrollIntoView({ behavior: 'smooth', inline: 'nearest' })
    }
  }, [activeTab])

  const renderForm = () => {
    switch (activeTab) {
      case 'Material':
        return <MaterialForm />
      case 'Project':
        return <ProjectForm />
      case 'Member':
        return <TeamMemberForm />
      case 'Customer':
        return <CustomerForm />
      default:
        return null
    }
  }

  return (
    <div
      className="w-full bg-white p-4 rounded-lg shadow-md text-black max-h-full flex flex-col"
      style={{ ['--card-pad' as any]: '1rem' }} // 👈 expose card padding if you want to use CSS vars later
    >
      {/* Header (rounded + clipped) */}
      <div className="-mx-4 -mt-4 border-b border-gray-300 shrink-0 rounded-t-lg">
        <div className="relative flex items-stretch" style={{ height: SHEET_HEIGHT_PX }}>
          {/* Category strip */}
          <div
            ref={scrollRef}
            className="flex-grow flex items-stretch overflow-hidden"
            style={{
              backgroundColor: utilityBg,
              borderTopRightRadius: `${UTILITY_TOP_RIGHT_RADIUS_PX}px`,
              borderTopLeftRadius: '0.5rem',
            }}
          >
            <ul className="relative flex items-stretch w-full">
              {tabs.map((tab, index) => {
                const dist = Math.abs(index - activeIndex)
                const bg = getBgForDist(dist, maxDist)
                const textClass = isDarkForDist(dist, maxDist) ? 'text-white' : 'text-black'
                const netLeft = index === 0 ? 0 : -SHEET_OVERLAP_PX
                const zIndex = tabs.length - index
                const rightRadius = index === tabs.length - 1 ? `${UTILITY_TOP_RIGHT_RADIUS_PX}px` : '4rem'

                return (
                  <li
                    key={tab}
                    data-active={activeTab === tab ? 'true' : 'false'}
                    className="relative flex-1 shrink-0"
                    style={{ zIndex, marginLeft: netLeft }}
                  >
                    <button
                      onClick={() => setActiveTab(tab)}
                      className={`relative w-full h-full text-[15px] font-normal uppercase ${textClass} hover:brightness-90 flex items-center justify-center`}
                      style={{
                        backgroundColor: bg,
                        paddingLeft: TAB_PADDING_LEFT,
                        paddingRight: TAB_PADDING_RIGHT,
                        borderTopLeftRadius: index === 0 ? '0.5rem' : '0',
                        borderTopRightRadius: rightRadius,
                        letterSpacing: LETTER_SPACING,
                      }}
                    >
                      {tab}
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

      {/* ⬇️ Ensure no extra inner padding so form sections can truly full-bleed */}
      <ScrollableContainer className="space-y-6 overflow-auto p-0">
        {renderForm()}
      </ScrollableContainer>
    </div>
  )
}
