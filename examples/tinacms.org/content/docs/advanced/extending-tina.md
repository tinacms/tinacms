---
title: Extending Tina
id: '/docs/advanced/extending-tina'
prev: null
next: /docs/advanced/configuring-field-plugin
---

Tina has many advanced features that allow the entire CMS editing experience to be customized.

## Customizing the CMS instance

The root `<TinaCMS>` container has an optional `cmsCallback` parameter that can be added to customize the CMS instance.

```tsx
// pages/_app.js
import TinaCMS from 'tinacms'

const App = ({ Component, pageProps }) => {
  return (
    <TinaCMS
      // ...
      cmsCallback={cms => {
        cms.sidebar.position = 'overlay'
      }}
    >
      <Component {...pageProps} />
    </TinaCMS>
  )
}

export default App
```

The `cmsCallback` hook might be used to alter Tina's UI, dynamically hide the sidebar on certain pages, tap into the CMS event bus, etc, but the most common use-case is for registering custom field plugins.

**Field Plugins** are the editable components that an editor will use to make changes to a site.

Continue reading to learn more about configuring and extending field plugins
