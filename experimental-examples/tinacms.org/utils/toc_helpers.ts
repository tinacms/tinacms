import React from 'react'

interface Heading {
  id?: string
  offset?: number
  level?: string
}

function createHeadings(
  contentRef: React.RefObject<HTMLDivElement>
): Heading[] {
  const headings = []
  const htmlElements = contentRef.current.querySelectorAll(
    'h1, h2, h3, h4, h5, h6'
  )

  htmlElements.forEach(function (heading: HTMLHeadingElement) {
    headings.push({
      id: heading.id,
      offset: heading.offsetTop,
      level: heading.tagName,
    })
  })
  return headings
}

export function createTocListener(
  contentRef: React.RefObject<HTMLDivElement>,
  setActiveIds: (activeIds: string[]) => void
): () => void {
  let tick = false
  const BASE_OFFSET = 16
  const THROTTLE_INTERVAL = 100
  const headings = createHeadings(contentRef)

  const throttledScroll = () => {
    const scrollPos = window.scrollY
    const newActiveIds = []
    const activeHeadingCandidates = headings.filter((heading) => {
      return heading.offset - scrollPos < BASE_OFFSET
    })

    const activeHeading =
      activeHeadingCandidates.length > 0
        ? activeHeadingCandidates.reduce((prev, current) =>
            prev.offset > current.offset ? prev : current
          )
        : {}
    newActiveIds.push(activeHeading.id)

    if (activeHeading.level != 'H2') {
      const activeHeadingParentCandidates =
        activeHeadingCandidates.length > 0
          ? activeHeadingCandidates.filter((heading) => {
              return heading.level == 'H2'
            })
          : []
      const activeHeadingParent =
        activeHeadingParentCandidates.length > 0
          ? activeHeadingParentCandidates.reduce((prev, current) =>
              prev.offset > current.offset ? prev : current
            )
          : {}

      if (activeHeadingParent.id) {
        newActiveIds.push(activeHeadingParent.id)
      }
    }

    setActiveIds(newActiveIds)
  }

  return function onScroll(): void {
    if (!tick) {
      setTimeout(function () {
        throttledScroll()
        tick = false
      }, THROTTLE_INTERVAL)
    }
    tick = true
  }
}

export function useTocListener(data) {
  const [activeIds, setActiveIds] = React.useState([])
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (typeof window === `undefined` || !contentRef.current) {
      return
    }

    const activeTocListener = createTocListener(contentRef, setActiveIds)
    window.addEventListener('scroll', activeTocListener)

    return () => window.removeEventListener('scroll', activeTocListener)
  }, [contentRef, data])

  return { contentRef, activeIds }
}
