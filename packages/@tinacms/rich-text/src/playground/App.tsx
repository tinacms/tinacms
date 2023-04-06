import React from 'react'
import { RichEditor } from '../rich-text'
import { parseMDX, stringifyMDX } from '@tinacms/mdx'

const modules = import.meta.glob('../../../mdx/src/next/tests/**/in.md', {
  as: 'raw',
})

function App() {
  // const [activeMd, setActiveMd] = React.useState<string | null>(null)
  const [activeMd, setActiveMd] = useLocalStorage('active-md', null)
  const [raw, setRaw] = React.useState<string | null>(null)
  const [json, setJson] = React.useState<object | null>(null)

  React.useEffect(() => {
    if (activeMd) {
      const moduleToImport = modules[activeMd]
      if (moduleToImport) {
        moduleToImport().then((value) => {
          setRaw(value)
        })
      } else {
        setRaw(null)
      }
    }
  }, [activeMd])

  return (
    <div className="grid grid-cols-12 h-screen w-screen">
      <div className="col-span-3">
        <ul>
          {Object.keys(modules).map((modKey) => {
            return (
              <li key={modKey}>
                <button
                  onClick={() => {
                    setJson(null)
                    setActiveMd(modKey)
                  }}
                  type="button"
                >
                  {modKey
                    .replace('../../../mdx/src/next/tests/', '')
                    .replace('/in.md', '')}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="col-span-9 w-full grid">
        <div className="grid grid-cols-2 h-screen w-full">
          <div className="h-full overflow-scroll px-2">
            <RichEditor
              key={raw}
              input={{
                value: raw
                  ? parseMDX(raw)
                  : {
                      type: 'root',
                      children: [
                        {
                          type: 'paragraph',
                          children: [{ type: 'text', value: '' }],
                        },
                      ],
                    },
                onChange: (value) => {
                  if (value) {
                    setJson(value)
                  }
                },
              }}
            />
          </div>
          {/* <Textarea key={`${json ? JSON.stringify(json) : ''}-json`} value={JSON.stringify(json, null, 2)} /> */}
          <div className="h-full">
            <div className="h-1/2">
              <Textarea
                value={raw ? raw : ''}
                onChange={(value) => {
                  setRaw(value)
                }}
              />
            </div>
            <div className="h-1/2">
              <Textarea
                key={`${json ? JSON.stringify(json) : ''}-out`}
                value={json ? stringifyMDX(json) : ''}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Textarea = ({
  value,
  onChange,
}: {
  value: string
  onChange?: (value: string) => void
}) => {
  return (
    <div className="bg-gray-300 font-mono relative h-full max-h-full overflow-scroll">
      <textarea
        className="absolute inset-0 h-full w-full"
        value={value}
        onChange={(e) => {
          if (onChange) {
            onChange(e.target.value)
          }
        }}
      />
    </div>
  )
}

export default App

// Hook
function useLocalStorage(key: string, initialValue: unknown) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = React.useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.log(error)
      return initialValue
    }
  })
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: unknown) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      // Save state
      setStoredValue(valueToStore)
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error)
    }
  }
  return [storedValue, setValue]
}
