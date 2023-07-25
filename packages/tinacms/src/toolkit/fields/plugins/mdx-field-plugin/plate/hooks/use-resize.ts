import React from 'react'

export const useResize = (ref, callback) => {
  React.useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        callback(entry)
      }
    })
    if (ref.current) {
      resizeObserver.observe(ref.current)
    }

    return () => resizeObserver.disconnect()
  }, [ref.current])
}
