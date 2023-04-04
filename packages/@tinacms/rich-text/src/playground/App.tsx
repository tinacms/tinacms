import React from 'react'
import { RichEditor } from '../rich-text'
import { parseMDX, stringifyMDX } from '@tinacms/mdx'

const modules = import.meta.glob('../../../mdx/src/next/tests/**/in.md', {
  as: 'raw',
})

function App() {
  const [activeMd, setActiveMd] = React.useState<string | null>(null)
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
        NAV
        <ul>
          {Object.keys(modules).map((modKey) => {
            return (
              <li>
                <button
                  onClick={() => {
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
      <div className="col-span-9 w-full grid grid-cols-2 gap-4 px-4 grid-rows-2">
        <Textarea value={raw ? raw : ''} onChange={(value) => setRaw(value)} />
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
        <Textarea value={json ? stringifyMDX(json) : ''} />
        <Textarea value={JSON.stringify(json, null, 2)} />
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
        className="absolute inset-0"
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
