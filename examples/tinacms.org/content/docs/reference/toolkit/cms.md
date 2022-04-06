---
title: The CMS
last_edited: '2021-11-10T00:00:00.000Z'
---

The CMS object in Tina is a container for attaching and accessing plugins, APIs, and the event bus. On its own, the CMS does very little; however, since it's the central integration point for everything that Tina does, it's extremely important!

## Accessing the CMS Object

The CMS object can be retrieved from context via the `useCMS` hook (from anywhere within the Tina provider). Reference the available [core properties](/docs/cms#reference) to work with.

```javascript
import * as React from 'react'
import { useCMS } from 'tinacms'

// <SomeComponent /> is assumed to be nested inside of the <TinaProvider> context
export default function SomeComponent() {
  const cms = useCMS()
  //...
}
```

## Disabling / Enabling the CMS

The CMS can be enabled or disabled via methods or configuration on the CMS object. Disabling the CMS prevents the editing UI from rendering and forms from registering.

```js
import * as React from 'react'
import { useCMS } from 'tinacms'

// <ExitButton /> is assumed to be nested inside of the <TinaProvider> context
export default function ExitButton() {
  const cms = useCMS()

  return (
    <button onClick={() => cms.toggle()}>
      {cms.enabled ? `Exit Tina` : `Edit with Tina`}
    </button>
  )
}
```

## CMS Configuration

When instantiating the `TinaCMS` object, you can pass in a configuration object. This allows you to configure some options for the sidebar, toolbar, and also allows you to configure plugins and APIs declaratively.

```typescript
interface TinaCMSConfig {
  enabled?: boolean
  plugins?: Plugin[]
  apis?: { [key: string]: any }
  sidebar?: SidebarConfig | boolean
  toolbar?: ToolbarConfig | boolean
  media?: {
    store: MediaStore
  }
  mediaOptions?: {
    pageSize?: number
  }
}

interface SidebarConfig {
  position?: SidebarPosition
  placeholder?: React.FC
  buttons?: {
    save: string
    reset: string
  }
}

interface ToolbarConfig {
  buttons?: {
    save: string
    reset: string
  }
}
```

---

| key          | usage                                                                     |
| ------------ | ------------------------------------------------------------------------- |
| **enabled**  | Controls whether the CMS is enabled or disabled. _Defaults to_ `false`    |
| **plugins**  | Array of plugins to be added to the CMS object.                           |
| **apis**     | Object containing APIs to be registered to the CMS                        |
| **sidebar**  | Enables and configures behavior of the sidebar                            |
| **toolbar**  | Configures behavior of the toolbar                                        |
| **media**    | Configures media.                                                         |
| **pageSize** | Sets how many media objects are displayed at a time in the media manager. |

---

## Reference

There are a number of [core properties](https://github.com/tinacms/tinacms/blob/master/packages/%40tinacms/core/src/cms.ts) that can be helpful in working with the CMS.

### TinaCMS Interface

```ts
interface TinaCMS {
  enabled: boolean
  disabled: boolean
  registerApi(name: string, api: any): void
  enable(): void
  disable(): void
  toggle(): void
}
```

| property      | description                                                          |
| ------------- | -------------------------------------------------------------------- |
| `enabled`     | Returns the enabled state. When `true`, content _can_ be edited.     |
| `disabled`    | Returns the disabled state. When `true`, content _cannot_ be edited. |
| `registerApi` | Registers a new external API with the CMS.                           |
| `enable`      | Enables the CMS so content can be edited.                            |
| `disable`     | Disables the CMS so content can no longer be edited.                 |
| `toggle`      | Toggles the enabled/disabled state of the CMS .                      |

> Use the `useCMS` hook to [access the CMS](/docs/reference/toolkit/cms#accessing-the-cms-object) and execute these methods as needed.
