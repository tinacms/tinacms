import { useState } from 'react'
import './App.css'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import ResizeHandle from './ResizeHandle'

function App() {
  const [count, setCount] = useState(0)

  return (
    <PanelGroup autoSaveId="example2" direction="horizontal">
      <Panel collapsible={true}>Sidebar</Panel>
      <ResizeHandle />
      <Panel>
        <PanelGroup autoSaveId="example" direction="vertical">
          <Panel>
            <div>one</div>
          </Panel>
          <ResizeHandle />
          <Panel>
            <div>two</div>
          </Panel>
        </PanelGroup>
      </Panel>
      <ResizeHandle />
      <Panel>
        <PanelGroup autoSaveId="example" direction="vertical">
          <Panel>
            <div>three</div>
          </Panel>
          <ResizeHandle />
          <Panel>
            <div>four</div>
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  )
}

export default App
