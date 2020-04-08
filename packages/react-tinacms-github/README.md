# react-tinacms-github

## Implementation:

Add the root TinacmsGithubProvider component to our main layout. In this case, we will use Github Auth.
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
      authenticate={() => authenticate('/api/create-github-access-token')}
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

```ts
//...EditLink.tsx
import { useGithubEditing } from 'react-tinacms-github'
export const EditLink = ({ editMode }: EditLinkProps) => {
  const github = useGithubEditing()
  return (
    <button
      onClick={
        editMode ? github.exitEditMode : github.enterEditMode
      }
    >
      {editMode ? 'Exit Edit Mode' : 'Edit This Site'}
    </button>
  )
}
```