// frontend/src/components/projects/ProjectCategories.tsx
import { useState, useEffect, useRef, type TransitionEvent } from 'react'
import { useAuth } from '@clerk/clerk-react'
import ProjectList from './ProjectList'
import Typography from '../common/Typography'

type Project = {
  id: string
  name: string
  category: string
  progress: number
}

type Category = {
  id: string
  name: string
}

type Props = {
  onProjectClick: (id: string) => void
  selectedId: string | null
  projects: Project[]
}

export default function ProjectCategories({ onProjectClick, selectedId, projects }: Props) {
  const { getToken } = useAuth()
  const [activeCategory, setActiveCategory] = useState<string>('IN-PROGRESS')
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const searchIconRef = useRef<HTMLImageElement>(null)

  // Refs to align the × → < morph
  const leftArrowRef = useRef<HTMLButtonElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // ======= SEARCH + LAYOUT TUNABLES =======
  const SEARCH_ANIM_MS = 1000 // grey overlay duration (reference speed)

  // White bar geometry
  const SEARCH_BAR_WIDTH_PX = 384
  const SEARCH_BAR_HEIGHT_PX = 34
  const SEARCH_BAR_RADIUS_PX = 9999

  // Overlay/controls geometry
  const SEARCH_LEFT_GAP_PX = 28
  const CLOSE_X_SIZE_PX = 18
  const CLOSE_X_RIGHT_GAP_PX = 12
  const DARK_RIGHT_PADDING_PX = 8
  const SEARCH_ICON_OVERHANG_RIGHT_PX = 6
  const UTILITY_CURVE_RADIUS_PX = 64 // bottom-left swoop of utility strip
  const OVERLAY_LEFT_CURVE_RADIUS_PX = 64
  const SEARCH_ALIGN_NUDGE_PX = 0
  const SEARCH_EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)'

  // Keep the icons module's top-right slightly curved at all times
  const UTILITY_TOP_RIGHT_RADIUS_PX = 12

  // === Right padding for the utility strip (used to offset dropdown) ===
  const UTILITY_RIGHT_PAD_PX = 12 // keeps a little breathing room for the + icon

  // === Your modifications (kept) ===
  const OVERLAY_OPEN_WIDTH_PX = 450
  const SEARCH_BAR_CLOSE_FACTOR = 0.7
  const CLOSE_RIGHT_SHIFT_PX = 0
  const SEARCH_BAR_RIGHT_PINCH_PX = 0   // both ends stay rounded; no extra pinch
  const SEARCH_BAR_FADE_MS = 500
  // ================================

  // Small lead time to hide the bar *just* before its width finishes
  const SEARCH_BAR_HIDE_EARLY_MS = 10

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  type Phase = 'closed' | 'opening' | 'open' | 'closing'
  const [searchPhase, setSearchPhase] = useState<Phase>('closed')

  // how far the × should glide to snap onto the underlying '<'
  const [closeShiftPx, setCloseShiftPx] = useState(0)

  // Overlay right offset so the growth originates at the icon (icon stays fixed)
  const [overlayRightOffset, setOverlayRightOffset] = useState<number>(56) // fallback

  // Hide the white bar completely near end-of-close so grey overlay never “pushes” it
  const barHideTimerRef = useRef<number | null>(null)
  const [isBarHidden, setIsBarHidden] = useState(true)

  const recalcOverlayRight = () => {
    const headerEl = headerRef.current
    const iconEl = searchIconRef.current
    if (!headerEl || !iconEl) return
    const headerRect = headerEl.getBoundingClientRect()
    const iconRect = iconEl.getBoundingClientRect()
    // Put overlay's RIGHT edge slightly to the RIGHT of the icon so the icon appears within the bar
    const offset = headerRect.right - (iconRect.right + SEARCH_ICON_OVERHANG_RIGHT_PX)
    if (Number.isFinite(offset)) setOverlayRightOffset(Math.max(0, offset))
  }

  useEffect(() => {
    recalcOverlayRight()
    const onResize = () => recalcOverlayRight()
    window.addEventListener('resize', onResize)
    let ro: ResizeObserver | null = null
    if (searchIconRef.current) {
      ro = new ResizeObserver(() => recalcOverlayRight())
      ro.observe(searchIconRef.current)
    }
    return () => {
      window.removeEventListener('resize', onResize)
      if (ro && searchIconRef.current) ro?.unobserve(searchIconRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openSearch = () => {
    // show bar immediately on open
    if (barHideTimerRef.current) { clearTimeout(barHideTimerRef.current); barHideTimerRef.current = null }
    setIsBarHidden(false)
    setIsSearchOpen(true)
    setSearchPhase('opening')
  }

  const closeSearch = () => {
    try {
      const closeEl = closeBtnRef.current
      const arrowEl = leftArrowRef.current
      if (closeEl && arrowEl) {
        const a = closeEl.getBoundingClientRect()
        const b = arrowEl.getBoundingClientRect()
        // No right-edge shift compensation (right edge stays fixed)
        setCloseShiftPx(b.left - a.left)
      } else {
        setCloseShiftPx(0)
      }
    } catch {
      setCloseShiftPx(0)
    }
    // ensure bar starts visible (to animate) then gets hidden near the end
    setIsBarHidden(false)
    setSearchPhase('closing')
    setIsSearchOpen(false)
  }

  // === compute search bar animation time (faster on close) ===
  const searchBarMs =
    searchPhase === 'closing' ? Math.round(SEARCH_ANIM_MS * SEARCH_BAR_CLOSE_FACTOR) : SEARCH_ANIM_MS

  // Manage “hide” timing so the bar fully disappears near the end of its close animation
  useEffect(() => {
    if (barHideTimerRef.current) { clearTimeout(barHideTimerRef.current); barHideTimerRef.current = null }

    if (searchPhase === 'opening') {
      setIsBarHidden(false)
    }

    if (searchPhase === 'closing') {
      // Hide just before the width transition finishes
      const t = Math.max(searchBarMs - SEARCH_BAR_HIDE_EARLY_MS, 0)
      barHideTimerRef.current = window.setTimeout(() => {
        setIsBarHidden(true)
      }, t) as unknown as number
    }

    if (searchPhase === 'closed') {
      setIsBarHidden(true)
    }

    return () => {
      if (barHideTimerRef.current) { clearTimeout(barHideTimerRef.current); barHideTimerRef.current = null }
    }
  }, [searchPhase, searchBarMs])

  const handleOverlayTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== 'width' && e.propertyName !== 'right') return
    setSearchPhase(isSearchOpen ? 'open' : 'closed')
    if (!isSearchOpen) setCloseShiftPx(0)
  }

  const effectiveCategories: Category[] = [
    { id: 'in-progress', name: 'IN-PROGRESS' },
    { id: 'completed', name: 'COMPLETED' },
  ]

  useEffect(() => {
    if (effectiveCategories.length > 0 && !effectiveCategories.some((cat) => cat.name === activeCategory)) {
      setActiveCategory(effectiveCategories[0].name)
    }
  }, [effectiveCategories, activeCategory])

  const activeIndex = effectiveCategories.findIndex(cat => cat.name === activeCategory)
  const categoryFiltered = activeCategory === 'IN-PROGRESS'
    ? projects.filter(p => p.progress < 100)
    : projects.filter(p => p.progress >= 100)
  const filtered = searchValue
    ? categoryFiltered.filter(p => p.name.toLowerCase().includes(searchValue.toLowerCase()))
    : categoryFiltered

  // ======= CATEGORY STRIP TUNABLES =======
  const SHEET_HEIGHT_PX   = 36   // header height
  const SHEET_OVERLAP_PX  = 20
  const SHEET_GAP_PX      = 20
  const UNDERLAP_WIDTH_PX = 2000
  const LETTER_SPACING = '0.1em'
  const TAB_PADDING_LEFT = '2rem'
  const TAB_PADDING_RIGHT = '3rem'
  const SCROLL_AMOUNT = 200
  const utilityBg = '#7A7A7A'
  // =======================================

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

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
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

  const handleScrollLeft = () => scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' })
  const handleScrollRight = () => scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' })

  // === right-side pinch & end-fade settings (closing only) ===
  const innerRightPx = searchPhase === 'closing' ? SEARCH_BAR_RIGHT_PINCH_PX : 0
  const fadeDelayMs = searchPhase === 'closing'
    ? Math.max(searchBarMs - SEARCH_BAR_FADE_MS, 0)
    : 0
  const contentOpacity = searchPhase === 'closing' ? 0 : 1

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md text-black h-full flex flex-col overflow-hidden">
      {/* Header (rounded + clipped) */}
      <div className="-mx-4 -mt-4 border-b border-gray-300 shrink-0 rounded-t-lg" ref={headerRef}>
        <div className="relative flex items-stretch" style={{ height: SHEET_HEIGHT_PX }}>
          {/* Category strip */}
          <div
            ref={scrollRef}
            className="flex-grow overflow-x-auto flex items-stretch"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              backgroundColor: utilityBg,
              // keep visible but disable interactions while overlay animates
              pointerEvents: searchPhase === 'closed' ? 'auto' : 'none',
              borderTopRightRadius: `${UTILITY_TOP_RIGHT_RADIUS_PX}px`, // keep slight curve visible
            }}
          >
            <style>{`
              [data-hide-scrollbar]::-webkit-scrollbar { display: none; }
            `}</style>
            <ul className="relative flex items-stretch" data-hide-scrollbar>
              {effectiveCategories.map((cat, index) => {
                const dist = Math.abs(index - activeIndex)
                const bg = getBgForDist(dist, maxDist)
                const textClass = isDarkForDist(dist, maxDist) ? 'text-white' : 'text-black'
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

          {/* Right utility area (underlay). Curve stays ON always. */}
          <div
            className="relative flex items-center justify-end gap-3"
            style={{
              backgroundColor: utilityBg,
              // EXPLICIT padding split so we know the exact right padding:
              paddingLeft: '0.75rem',
              paddingRight: UTILITY_RIGHT_PAD_PX, // px number -> 12px
              height: '100%',
              minWidth: 'fit-content',
              zIndex: 10, // UNDER the overlay
              marginLeft: '-3rem',
              borderBottomLeftRadius: `${UTILITY_CURVE_RADIUS_PX}px`,
              borderTopRightRadius: `${UTILITY_TOP_RIGHT_RADIUS_PX}px`, // keep curved forever
            }}
          >
            {/* Always render arrows so the '<' target exists behind the overlay */}
            <button
              ref={leftArrowRef}
              onClick={handleScrollLeft}
              className="text-white text-xl select-none"
              aria-label="Scroll left"
              disabled={!canScrollLeft}
              style={{ opacity: canScrollLeft ? 1 : 0.35, cursor: canScrollLeft ? 'pointer' : 'default' }}
            >
              &lt;
            </button>
            <button
              onClick={handleScrollRight}
              className="text-white text-xl select-none"
              aria-label="Scroll right"
              disabled={!canScrollRight}
              style={{ opacity: canScrollRight ? 1 : 0.35, cursor: canScrollRight ? 'pointer' : 'default' }}
            >
              &gt;
            </button>

            {/* Search icon (underlay). The overlay shows a black icon inside the white bar. */}
            <button
              onClick={() => (searchPhase === 'closed' ? openSearch() : closeSearch())}
              aria-label="Toggle search"
              className="p-0 m-0"
              style={{ lineHeight: 0 }}
            >
              <img
                ref={searchIconRef}
                src="/search.png"
                alt="Search"
                className={`w-[20px] h-[20px] ${isSearchOpen ? '' : 'invert'}`}
              />
            </button>
          </div>

          {/* Left-expanding SEARCH OVERLAY — sits ON TOP of the icons strip */}
          <div
            ref={overlayRef}
            className="absolute top-0 h-full"
            onTransitionEnd={handleOverlayTransitionEnd}
            style={{
              // FIXED right edge (no shift on close)
              right: overlayRightOffset + SEARCH_ALIGN_NUDGE_PX + (searchPhase === 'closing' ? CLOSE_RIGHT_SHIFT_PX : 0),
              width: isSearchOpen ? OVERLAY_OPEN_WIDTH_PX : 0,
              transition: `width ${SEARCH_ANIM_MS}ms ${SEARCH_EASE}, right ${SEARCH_ANIM_MS}ms ${SEARCH_EASE}`,
              backgroundColor: utilityBg,
              zIndex: 30, // ABOVE utility & arrows
              overflow: 'hidden',
              // Keep curves visible on overlay too (prevents any square glimpse)
              borderTopRightRadius: `${UTILITY_TOP_RIGHT_RADIUS_PX}px`,
              borderBottomLeftRadius: isSearchOpen || searchPhase === 'closing' ? `${OVERLAY_LEFT_CURVE_RADIUS_PX}px` : 0,
            }}
          >
            <div className="relative h-full flex items-center">
              {/* Close button that morphs × → < and glides to the underlying '<' spot */}
              <button
                ref={closeBtnRef}
                onClick={closeSearch}
                aria-label="Close search"
                className="shrink-0 text-white relative"
                style={{
                  marginLeft: SEARCH_LEFT_GAP_PX,
                  marginRight: CLOSE_X_RIGHT_GAP_PX,
                  fontSize: CLOSE_X_SIZE_PX,
                  lineHeight: 1,
                  transform: `translateX(${searchPhase === 'closing' ? closeShiftPx : 0}px)`,
                  transition: `transform ${SEARCH_ANIM_MS}ms ${SEARCH_EASE}`,
                }}
              >
                {/* stack × and < to crossfade cleanly */}
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'inline-block',
                    opacity: searchPhase === 'closing' ? 0 : 1,
                    transition: `opacity ${Math.max(SEARCH_ANIM_MS - 200, 200)}ms ${SEARCH_EASE}`,
                  }}
                >
                  ×
                </span>
                <span
                  aria-hidden
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    opacity: searchPhase === 'closing' ? 1 : 0,
                    transition: `opacity ${Math.max(SEARCH_ANIM_MS - 200, 200)}ms ${SEARCH_EASE}`,
                  }}
                >
                  &lt;
                </span>
              </button>

              {/* White search bar: wrapper shrinks from LEFT; inner pill keeps both rounded ends.
                  It fully hides right before width hits zero so the overlay never “pushes” it. */}
              <div
                className="relative ml-auto"
                style={{
                  width: isSearchOpen ? SEARCH_BAR_WIDTH_PX : 0,
                  height: SEARCH_BAR_HEIGHT_PX,
                  transition: `width ${searchBarMs}ms ${SEARCH_EASE}`,
                  overflow: 'visible',
                  marginRight: DARK_RIGHT_PADDING_PX,
                }}
              >
                {/* Inner pill with rounded caps; hidden near the end of close */}
                <div
                  className="absolute inset-y-0 left-0"
                  style={{
                    display: isBarHidden ? 'none' : 'flex',
                    right: innerRightPx, // 0 per your setting; keeps rounded right end
                    transition: `right ${searchBarMs}ms ${SEARCH_EASE}, opacity ${SEARCH_BAR_FADE_MS}ms ${SEARCH_EASE}`,
                    transitionDelay: `0ms, ${fadeDelayMs}ms`,
                    borderRadius: SEARCH_BAR_RADIUS_PX,
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
                    alignItems: 'center',
                    paddingLeft: 16,
                    paddingRight: 40, // space for the right-side icon
                    opacity: contentOpacity,
                    pointerEvents: 'auto',
                  }}
                >
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="ENTER YOUR SEARCH KEY WORD"
                    className="w-full text-[13px] placeholder:text-[13px] text-black placeholder:text-black outline-none"
                    style={{
                      height: '100%',
                      backgroundColor: 'transparent', // pill provides the white background
                      border: 0,
                      padding: 0, // padding handled by pill
                    }}
                  />
                  {/* black search icon inside the white bar */}
                  <img
                    src="/search.png"
                    alt=""
                    aria-hidden
                    className="absolute"
                    style={{
                      width: 18,
                      height: 18,
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* /SEARCH OVERLAY */}
        </div>
      </div>

      <ProjectList projects={filtered} onProjectClick={onProjectClick} selectedId={selectedId} className="flex-1" />
    </div>
  )
}