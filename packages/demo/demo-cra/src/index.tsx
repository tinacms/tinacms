import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import { CMS } from '@tinacms/core'
import { CMSContext, CMS } from '@tinacms/react-tinacms'

let cms = new CMS()

ReactDOM.render(
  <CMSContext.Provider value={cms}>
    <App />
  </CMSContext.Provider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
