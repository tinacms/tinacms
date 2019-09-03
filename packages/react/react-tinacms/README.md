# `@tinacms/react-tinacms`

## Install

```
npm install --save @tinacms/react-tinacms
```

or

```
yarn add @tinacms/react-tinacms
```

## Getting Started

`@tinacms/cms-react` is a thin wrapper around the `@tinacms/cms`.

```javascript
import * as React from 'react'
import { CMS } from '@tinacms/core'
import { CMSContext } from '@tinacms/react-tinacms'

let cms = new CMS()
cms.forms

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

## API

### `CMSContext`

A React context for providing a `CMS` instance.

### `useCMS(): CMS`

A React hook for accessing the `CMS`.

### `useCMSForm(name: string): Form | null`

A React hook for creating and subscribing to a `Form` in the `CMS`.

### `useSubscribable(subscribable: Subscribable, callback?: () => void): void`

A React hook for subscribing to some `Subscribable`.
