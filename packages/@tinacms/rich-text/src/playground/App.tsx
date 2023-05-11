import * as React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route, Outlet, Link, useParams } from 'react-router-dom'
import { RichEditor } from '../rich-text'
import { parseMDX, stringifyMDX } from '@tinacms/mdx'

const modules = import.meta.glob('../../../mdx/src/next/tests/**/in.md', {
  as: 'raw',
})

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path=":mod" element={<Editor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function Layout() {
  return (
    <div className="grid grid-cols-12 h-screen w-screen">
      {/* A "layout route" is a good place to put markup you want to
          share across all the pages on your site, like navigation. */}
      <nav className="col-span-3 bg-gray-800 text-gray-50 h-screen overflow-scroll pt-4 px-2">
        <ul>
          {Object.keys(modules).map((modKey) => {
            const display = modKey
              .replace('../../../mdx/src/next/tests/', '')
              .replace('/in.md', '')
            return (
              <li key={modKey}>
                <Link
                  to={display}
                  className="w-full overflow-hidden p-1 hover:bg-gray-700 block rounded-sm truncate"
                  type="button"
                >
                  <span className="whitespace-pre text-sm max-w-full capitalize">
                    {display.split('-').join(' ')}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="col-span-9 w-full grid">
        <Outlet />
      </div>
    </div>
  )
}

function Editor() {
  const { mod } = useParams()
  const [raw, setRaw] = React.useState<string | null>(null)
  const [json, setJson] = React.useState<object | null>(null)

  React.useEffect(() => {
    const moduleToImport = modules[`../../../mdx/src/next/tests/${mod}/in.md`]
    if (moduleToImport) {
      moduleToImport().then((value) => {
        setRaw(value)
      })
    } else {
      setRaw(null)
    }
  }, [mod])

  return (
    <div className="col-span-9 w-full grid">
      <div className="grid grid-cols-2 h-screen w-full">
        <div className="h-full overflow-scroll p-2">
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
        <div className="h-full flex flex-col gap-2 py-2">
          <Textarea
            value={raw ? raw : ''}
            onChange={(value) => {
              setRaw(value)
            }}
          />
          <Textarea
            key={`${json ? JSON.stringify(json) : ''}-out`}
            value={json ? stringifyMDX(json) : ''}
          />
        </div>
      </div>
    </div>
  )
}

export const Textarea = ({
  value,
  onChange,
}: {
  value: string
  onChange?: (value: string) => void
}) => {
  return (
    <div className="bg-gray-300 w-full border border-gray-800 rounded-lg font-mono relative h-full max-h-full overflow-scroll">
      <textarea
        className="absolute inset-0 h-full w-full text-sm"
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
