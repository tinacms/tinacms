import './App.css'
import React from 'react'
import { RichEditor } from '../rich-text'

function App() {
  return (
    <div className="px-6 py-24 max-w-xl mx-auto w-[700px]">
      <RichEditor
        input={{
          value: {
            type: 'root',
            children: [
              { type: 'paragraph', children: [{ type: 'text', value: 'hi' }] },
            ],
          },
          onChange: () => {},
        }}
      />
    </div>
  )
}

export default App
