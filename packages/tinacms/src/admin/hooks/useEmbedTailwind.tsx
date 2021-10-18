import { useEffect } from 'react'

const useEmbedTailwind = () => {
  useEffect(() => {
    const isSSR = typeof window === 'undefined'
    if (!isSSR) {
      const head = document.head
      const link = document.createElement('link')
      link.id = 'tina-admin-stylesheet'
      link.type = 'text/css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css'
      head.appendChild(link)
    }
  }, [])
}

export default useEmbedTailwind
