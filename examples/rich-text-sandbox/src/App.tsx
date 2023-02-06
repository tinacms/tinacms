import React from 'react'
import { Panel, PanelGroup } from 'react-resizable-panels'
import ResizeHandle from './ResizeHandle'
import MonacoEditor from 'react-monaco-editor'
import { Sidebar } from './Sidebar'
import { field } from './field'
import { parseMDX, RootElement, stringifyMDX } from './mdx'
import { useLocalStorage } from './useLocalStorage'

function App() {
  const [text, setText] = useLocalStorage('text', '')
  const [parsedText, setParsedText] = React.useState<RootElement>({
    type: 'root',
    children: [],
  })

  React.useEffect(() => {
    // @ts-ignore
    setParsedText(parseMDX(text, field, (v) => v))
  }, [text])

  return (
    <PanelGroup autoSaveId="example2" direction="horizontal">
      <Panel className="bg-yellow-100" collapsible={true}>
        <Sidebar setText={setText} />
      </Panel>
      <ResizeHandle direction="horizontal" />
      <Panel>
        <PanelGroup autoSaveId="example" direction="vertical">
          <Editor value={text} onChange={setText} />
          <ResizeHandle />
          {/* @ts-ignore */}
          {/* <Editor value={stringifyMDX(parsedText, field, (v) => v) || ''} /> */}
        </PanelGroup>
      </Panel>
      <ResizeHandle direction="horizontal" />
      <Panel>
        <PanelGroup autoSaveId="example" direction="vertical">
          <Editor
            onChange={(value) => setParsedText(JSON.parse(value))}
            value={JSON.stringify(parsedText, null, 2)}
          />
        </PanelGroup>
      </Panel>
    </PanelGroup>
  )
}

const Editor = ({
  value,
  onChange,
}: {
  value: string
  onChange?: (value: string) => void
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [editorBox, setEditorBox] = React.useState({
    width: 0,
    height: 0,
  })
  const onRawEditorResize = () => {
    if (editorRef.current) {
      const box = editorRef.current.getBoundingClientRect()
      setEditorBox({ width: box.width, height: box.height })
    }
  }
  return (
    <Panel className="bg-red-100 relative" onResize={onRawEditorResize}>
      <div ref={editorRef} className="absolute inset-0" />
      <MonacoEditor
        height={editorBox.height}
        width={editorBox.width}
        language="markdown"
        value={value}
        options={{
          minimap: {
            enabled: false,
          },
          renderLineHighlight: 'none',
          overviewRulerBorder: false,
          wordWrap: 'on',
        }}
        onChange={(value: string) => {
          if (onChange) {
            onChange(value)
          }
        }}
      />
    </Panel>
  )
}

export default App
