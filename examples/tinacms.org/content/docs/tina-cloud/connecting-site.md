---
title: Connecting the site
next: '/docs/tina-cloud/faq'
---

Once you've created a project within the **Tina Cloud**, the next step is to connect your site. Once connected, your project's editors will be able to save content directly to its GitHub repository, entirely from within your site.

## Enabling Tina Cloud in TinaCMS

In the [Contextual Editing doc](/docs/tinacms-context/), we showed you how the Tina context is setup on your site.

To have editing work in production, Change the `apiURL` to:

```
https://content.tinajs.io/content/<myClientId>/github/<myBranch>
```

```diff
// pages/_app.js
import TinaCMS from 'tinacms'

- const apiURL = `http://localhost:4001/graphql`
+ const apiURL = `https://content.tinajs.io/content/${myClientId}/github/${myBranch}`

const App = ({ Component, pageProps }) => {
  return (
    <TinaCMS
      apiURL={apiURL}
      // ... other props
    >
      <Component {...pageProps} />
    </TinaCMS>
  )
}

export default App
```

`<myClientId>` is the value from the Tina Cloud dashboard, and `<myBranch>` is the branch which you wish to communicate with.

## Using the deployment branch

Typically you'll want to use the branch that you're deploying with your site. This will vary depending on your host, but most will provide an environment variable of some sort that you can use. Note that your client ID isn't a secret and is not likely to change, so hardcoding it is usually ok.

```tsx
// pages/_app.js
import TinaCMS from 'tinacms'

const branch = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF
const clientId = 'YOUR-CLIENT-ID-HERE'

// When working locally, hit our local filesystem.
// On a Vercel deployment, hit the Tina Cloud API
const apiURL =
  process.env.NODE_ENV == 'development'
    ? 'http://localhost:4001/graphql'
    : `https://content.tinajs.io/content/${clientId}/github/${branch}`

const App = ({ Component, pageProps }) => {
  return (
    <TinaCMS
      apiURL={apiURL}
      // ... other props
    >
      <Component {...pageProps} />
    </TinaCMS>
  )
}

export default App
```

> `NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF` is a [system environment variable](https://vercel.com/docs/concepts/projects/environment-variables#system-environment-variables) that represents the branch that has made the deployment commit. If not using Vercel, this can replaced with a custom environment variable, or even a hardcoded value.
