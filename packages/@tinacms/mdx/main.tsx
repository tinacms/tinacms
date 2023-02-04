import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import { MarkdownPlayground } from './markdown'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MarkdownPlayground />
  </React.StrictMode>
)
