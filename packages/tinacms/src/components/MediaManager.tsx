import * as React from 'react'
import { useState, useEffect } from 'react'
import { useCMS } from '../react-tinacms'
import { MediaFilter, Media } from '../media'

interface MediaProps {
  multiple?: boolean
  selected?: string[]
  disabled?: MediaFilter
  filter?: MediaFilter
  onChoose?(media: Media[]): void
}

export const MediaManager = (props: MediaProps) => {
  let cms = useCMS()
  let [allMedia, setMedia] = useState([] as any)

  let { selected, handleClickToSelect } = useSelection(props.selected)

  useEffect(() => {
    ;(async () => {
      let media = await cms.media.store.list({ limit: 8, offset: 0 })
      setMedia(media)
    })()
  }, [])

  return (
    <div style={{ display: 'flex' }}>
      <nav>
        <button
          disabled={!selected.length}
          onClick={() => cms.media.store.delete(selected[0])}
        >
          Delete {!!selected.length && `${selected.length} items`}
        </button>
        {props.onChoose && (
          <button
            disabled={!selected.length}
            onClick={() => {
              props.onChoose!(
                // TODO: `seleted` should be Media[]
                selected.map(ref =>
                  allMedia.find((media: Media) => media.reference === ref)
                )
              )
            }}
          >
            Choose
          </button>
        )}
      </nav>
      {allMedia.map((media: Media) => (
        <div
          key={media.src}
          style={{
            border: '2px solid',
            padding: '.5rem',
            margin: '.5rem',
            borderColor: selected.includes(media.reference) ? 'green' : 'black',
          }}
          onClick={event => {
            handleClickToSelect(event, media)
          }}
        >
          file: {media.src}
        </div>
      ))}
    </div>
  )
}

/**
 * NOTE: This is curently more complex then necessary.
 * Using a reducer will be useful once we implement multiselect.
 */
function useSelection(preselect: string[] = []) {
  const [state, dispatch] = React.useReducer(singleSelectReducer, {
    lastToggled: null,
    selected: preselect,
  })

  return {
    ...state,
    handleClickToSelect(
      _: React.MouseEvent<HTMLDivElement, MouseEvent>,
      media: Media
    ) {
      dispatch({
        type: 'SELECT_MEDIA',
        selected: [media.reference],
      })
    },
  }
}

export interface SelectionState {
  lastToggled: string | null
  selected: string[]
}

function singleSelectReducer(
  state: SelectionState,
  changes: any
): SelectionState {
  switch (changes.type) {
    case 'SELECT_MEDIA':
    case 'SHIFT_SELECT_MEDIA':
      let lastSelected = changes.selected[changes.selected.length - 1]
      return {
        ...state,
        selected:
          state.selected.indexOf(lastSelected) >= 0 ? [] : [lastSelected],
      }
    default:
      return { ...state, ...changes }
  }
}
