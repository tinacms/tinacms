---
title: Upgrading to v0.65
---

> We've made some recent changes to the frontend Tina API. Everything is still currently backwards-compatible if you upgrade to 0.65.3, but support for some of the legacy props on `<TinaCMS>` will likely be removed in the future: `isLocalClient`,`branch`,`clientId`,`query`,`data`,`variables`

## The "apiURL" prop

Previously, setting up Tina looked like this:

```jsx
// ...
const App = ({ Component, pageProps }) => {
  return (
    <TinaCMS
      // ...
      isLocalClient={true}
      branch="main"
      clientId="<some-id-from-tina-cloud>"
    >
      {//...}
    </TinaCMS>
  )
}
```

It was a tad clunky, as branch and clientId didn't do anything if isLocalClient was set to true.

We've deprecated `isLocalClient`, `branch`, and `clientId`, and replaced them with a single api url prop:

```jsx
   <TinaCMS
      /**
       * The URL for the content API.
       *
       * When working locally, this should be http://localhost:4001/graphql.
       *
       * For Tina Cloud, use https://content.tinajs.io/content/my-client-id/github/my-branch
       */
      apiURL="http://localhost:4001/graphql"
    >
```

A common full implementation is:

```jsx
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
```

## The introduction of `useTina`

`useTina` allows devs to register forms, and setup contextual editing on a page-level, rather than having to pass everything through the root `<TinaCMS>` provider

### Example implementation

For the full example, see the basic starter in this PR: https://github.com/tinacms/tinacms/pull/2426/files#diff-42691b463aec5743dc024951e2db4ed514228f73d276082d4e6e1cdad9b1b246

```jsx
//app.jsx

const App = ({ Component, pageProps }) => {
  return (
    <>
      <TinaEditProvider
        showEditButton={true}
        editMode={
          <TinaCMS apiURL={apiURL}>
            <Component {...pageProps} />
          </TinaCMS>
        }
      >
        <Component {...pageProps} />
      </TinaEditProvider>
    </>
  )
}
```

```jsx
//index.jsx
// ...

const query = `{
  getPageDocument(relativePath: "home.mdx"){
    data{
      body
    }
  }
}`

export default function Home(props) {
  const { data } = useTina({
    query,
    variables: {},
    data: props.data,
  })

  const content = data.getPageDocument.data.body
  return (
    <Layout>
      <TinaMarkdown content={content} />
    </Layout>
  )
}

export const getStaticProps = async () => {
  const variables = {}
  const data = await staticRequest({
    query,
    variables,
  })
  return {
    props: {
      data,
    },
  }
}
```

> Note! You can only have one `useTina` registered at a time, or they will step over eachother.

You will also notice that `TinaCMS` now renders a ReactNode, instead of render props as its children:

```diff
  <TinaCMS apiURL={apiURL}>
-   {(livePageProps) => <Component {...livePageProps} />}
+    <Component {...pageProps} />
  </TinaCMS>
```

You can read more about the reasoning behind the change in the [initial PR](https://github.com/tinacms/tinacms/pull/2426)

### Common issues

#### Content not contextually updating

If you wire this up on your site, and the forms are registered but the main content isn't contextually updating based on the sidebar values, then you likely aren't using the `data` value from `useTina`

The likely fix:

```diff
export default function Home(props) {
  const { data } = useTina({
    query,
    variables: {},
    data: props.data,
  })

  return (
-    <div>{props.data.getPageDocument.data.body}</div>
+    <div>{data.getPageDocument.data.body}</div>
  )
}
```

#### Register layout-level forms

A layout level "QueryContainer" can be created to register the `useForm` hook at a higher level than pages, if you're looking to make something outside of your pages editable.

[See the cloud starter for an example](https://github.com/tinacms/tina-cloud-starter/blob/main/pages/_app.tsx#L11)
