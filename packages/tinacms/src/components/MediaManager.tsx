import * as React from 'react'
import { useState, useEffect } from 'react'
import { MediaProps } from '../media'
import { useCMS } from '../react-tinacms'

export const MediaManager = (props: MediaProps) => {
  let cms = useCMS()
  let [media, setMedia] = useState([] as any)
  let [selected, setSelected] = useState(props.selected)
  useEffect(() => {
    ;(async () => {
      let media = await cms.media.store.list({ limit: 8, offset: 0 })
      setMedia(media)
    })()
  }, [])

  return (
    <div style={{ display: 'flex' }}>
      {media.map((m: any) => (
        <div
          style={{ border: '1px dotted', padding: '.5rem', margin: '.5rem' }}
        >
          file: {m.src}
        </div>
      ))}
    </div>
  )
}
