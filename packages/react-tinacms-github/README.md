# react-tinacms-github

This package provides helpers for setting up TinaCMS to use the Github API, with Github authentication.

## Installation

```
npm install --save react-tinacms-github
```

or

```
yarn add react-tinacms-github
```

## Getting Started

### Register the GithubClient

We will want to use the GithubClient to load/save our content using the Github API. Let's add it as an API plugin.

```ts
import { TinaCMS } from 'tinacms'
import { GithubClient } from 'react-tinacms-github'

const cms = new TinaCMS({
  apis: {
    github: new GithubClient({
      proxy: '/api/proxy-github',
      authCallbackRoute: '/api/create-github-access-token'
      clientId: process.env.GITHUB_CLIENT_ID,
      baseRepoFullName: process.env.REPO_FULL_NAME // e.g: tinacms/tinacms.org,
    })
  }
})
```

### Managing "edit-mode" state

Add the root `TinacmsGithubProvider` component to our main layout. We will supply it with handlers for authenticating and entering/exiting edit-mode.
In this case, we will hit our `/api` server functions.

```tsx
// YourLayout.ts
import { TinacmsGithubProvider } from 'react-tinacms-github';

const enterEditMode = () => {
  return fetch(`/api/preview`).then(() => {
    window.location.href = window.location.pathname
  })
}

const exitEditMode = () => {
  return fetch(`/api/reset-preview`).then(() => {
    window.location.reload()
  })
}

const YourLayout = ({ editMode, error, children }) => {
  return (
    <TinacmsGithubProvider
      editMode={editMode}
      enterEditMode={enterEditMode}
      exitEditMode={exitEditMode}
      error={error}>
      {children}
    </TinacmsGithubProvider>
  )
}
```

### Auth Redirects

We will also need a few Github Specific pages to redirect the user to while authenticating with Github

```tsx
//pages/github/authorizing.tsx
// Our Github app redirects back to this page with auth code
import { useGithubAuthRedirect } from 'react-tinacms-github'

export default function Authorizing() {
  // Let the main app know, that we receieved an auth code from the Github redirect
  useGithubAuthRedirect()
  return (
      <h2>Authorizing with Github, Please wait...</h2>
  )
}
```

### Entering / Exiting "edit-mode"


We will need a way to enter/exit mode from our site. Let's create an "Edit Link" button. Ours will take `isEditing` as a parameter.

_If you are using Next.js's [preview-mode](https://nextjs.org/docs/advanced-features/preview-mode) for the editing environment, this `isEditing` value might get sent from your getStaticProps function._

```tsx
//...EditLink.tsx
import { useGithubEditing } from 'react-tinacms-github'

export interface EditLinkProps {
  isEditing: boolean
}

export const EditLink = ({ isEditing }: EditLinkProps) => {
  const github = useGithubEditing()

  return (
    <button
      onClick={
        isEditing ? github.exitEditMode : github.enterEditMode
      }
    >
      {isEditing ? 'Exit Edit Mode' : 'Edit This Site'}
    </button>
  )
}
```

### Github Oauth App:

In GitHub, within your account Settings, click [Oauth Apps](https://github.com/settings/developers) under Developer Settings.

click "New Oauth App".

For the **Authorization callback URL**, enter the url for the "authorizing" page that [you created above](#auth-redirects) (e.g https://your-url/github/authorizing). Fill out the other fields with your custom values.

The generated **Client ID** will be used in your site (remember, we passed this value into the Github `authenticate` method earlier).

The **Client Secret** will likely be used by your backend.


### Using Github Forms

Any forms that we have on our site can be created with the `useGithubJsonForm` or `useGithubMarkdownForm` helpers

```tsx
function BlogTemplate({ jsonFile }) {
  const formOptions = {
    label: 'Blog Post',
    fields: [],
  }

  // Registers a JSON Tina Form
  const [data, form] = useGithubJsonForm(jsonFile, formOptions)

  // ...
}
```

`useGithubJsonForm` will use the `GithubClient` api that we [registered earlier](#register-the-githubclient).

## Next steps

Now that we have configured our front-end to use Github, we will need to setup some backend functions to handle authentication.
If you are using Nextjs, you may want to use the [next-tinacms-github](https://github.com/tinacms/tinacms/tree/master/packages/next-tinacms-github) package.