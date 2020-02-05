import * as React from 'react'
import { useState, useEffect } from 'react'
import { useCMS } from '../react-tinacms'
import { MediaFilter, Media } from '../media'
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components'
import { radius, color, font } from '@tinacms/styles'

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
    <div>
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
      <MediaDropZone
        onDrop={files => {
          console.log('DROP')
          cms.media.store.persist(files)
        }}
      >
        {/* TODO: PREVIEW IMAGE WHILE IT IS BEING UPLOADED */}
        {allMedia.map((media: Media) => (
          <div
            key={media.src}
            style={{
              border: '2px solid',
              padding: '.5rem',
              margin: '.5rem',
              borderColor: selected.includes(media.reference)
                ? 'green'
                : 'black',
            }}
            onClick={event => {
              handleClickToSelect(event, media)
              event.stopPropagation()
              event.preventDefault()
            }}
          >
            file: {media.src}
          </div>
        ))}
      </MediaDropZone>
    </div>
  )
}

interface ImageUploadProps {
  onDrop: (acceptedFiles: File[]) => void
  children: any
}

const MediaDropZone = ({ onDrop, children }: ImageUploadProps) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: '*',
    onDrop,
    noClick: true,
    noDragEventsBubbling: false,
  })

  return (
    <div
      {...getRootProps({ isDragActive, isDragAccept, isDragReject })}
      style={{
        display: 'flex',
        outline: isDragActive ? '2px solid pink' : '',
        minHeight: '50vh',
      }}
    >
      <input {...getInputProps()} />
      {children}
    </div>
  )
}

const DropArea = styled.div`
  border-radius: ${radius('small')};
  flex: 1;
  display: flex;
  flex-direction: column;
  outline: none;
  cursor: pointer;
`

const ImgPlaceholder = styled.div`
  text-align: center;
  border-radius: ${radius('small')};
  background-color: ${color.grey(2)};
  color: ${color.grey(4)};
  line-height: 1.35;
  padding: 12px 0;
  font-size: ${font.size(2)};
  font-weight: 500;
  transition: all 85ms ease-out;
  &:hover {
    opacity: 0.6;
  }
`

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
