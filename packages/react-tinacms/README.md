# react-tinacms

The `react-tinacms` package provides helpers for using Tina in React applications

Tina is a lightweight but powerful toolkit for creating a site editing ui with javascript components. Tina surfaces superpowers for dev’s to create, expand on and customize a simple yet intuitive ui for editing content.

Tina is optimized for nextgen JAMstack tools. It is based in javascript and is extensible enough to be configured with many different frameworks. Right now we have explored using Tina with Gatsby, Create-React-App & Next.js, with plans to dive into Vue.

[Visit the website to learn more!](https://tinacms.org/docs/)

## Install

```
npm install --save react-tinacms
```

or

```
yarn add react-tinacms
```

## Getting Started

```javascript
import * as React from 'react'
import { CMS } from 'tinacms'
import { CMSContext } from 'react-tinacms'

let cms = new CMS()

function MyApp() {
  let cms = useCMS()

  return (
    <div>
      <ul>
        {cms.forms.all().map(form => {
          return <li key={form.name}>{form.name}</li>
        })}
      </ul>
    </div>
  )
}

React.render(
  <CMSContext.Provider value={cms}>
    <MyApp />
  </CMSContext.Provider>,
  document.body
)
```
