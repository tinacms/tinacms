# react-tinacms-github

## Implementation:

Add the root `TinacmsGithubProvider` component to our main layout. We will supply it with handlers for authenticating and entering/exiting edit-mode.
In this case, we will hit our `/api` server functions.

```ts
// YourLayout.ts
import { TinacmsGithubProvider, authenticate } from 'react-tinacms-github';

const enterEditMode = () =>
  fetch(`/api/preview`).then(() => {
    window.location.href = window.location.pathname
  })
const exitEditMode = () => {
  fetch(`/api/reset-preview`).then(() => {
    window.location.reload()
  })
}
const YourLayout = ({ Component, pageProps, children }) => {
  return (<TinacmsGithubProvider
      authenticate={() => authenticate(process.env.GITHUB_CLIENT_ID, '/api/create-github-access-token')}
      enterEditMode={enterEditMode}
      exitEditMode={exitEditMode}>
      {children}
    </TinacmsGithubProvider>)
}
```

Add error handling to our forms which prompt Github-specific action when errors occur (e.g a fork no longer exists).
```ts
// YourSiteForm.ts

import { useGithubErrorListener } from 'react-tinacms-github'

const YourSiteForm = ({ form, children }) => {
  useGithubErrorListener(form)
  return (
    <FormLayout>
      {children}
    </FormLayout>
  )
}
```

You will also need a few Github Specific pages to handle auth...

Github auth callback page. 
```ts
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

We will need a way to enter/exit mode from our site. Let's create an "Edit Link" button.
Ours will take `isEditing` as a parameter. 

_If you are using Next.js's [preview-mode](https://nextjs.org/docs/advanced-features/preview-mode) for the editing environment, this `isEditing` value might get sent from your getStaticProps function._

```ts
//...EditLink.tsx
import { useGithubEditing } from 'react-tinacms-github'
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

## Github Oauth App:

In GitHub, within your account Settings, click [Oauth Apps](https://github.com/settings/developers) under Developer Settings.

click "New Oauth App".

For the **Authorization callback URL**, enter the url for the "authorizing" page that you created above (e.g https://your-url/github/authorizing). Fill out the other fields with your custom values.

The generated **Client ID** will be used in your site (remember, we passed this value into the Github `authenticate` method earlier). 

The **Client Secret** will likely be used by your backend.