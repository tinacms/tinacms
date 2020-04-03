# react-tinacms-github

## Implementation:

Add the root OpenAuthoringProvider component to our main layout. In this case, we will use Github Auth.
```ts
// YourLayout.ts
import { authenticate }  from '@tinacms/github-auth'
import OpenAuthoringProvider from 'react-tinacms-github'
const enterEditMode = () =>
  fetch(`/api/preview`).then(() => {
    window.location.href = window.location.pathname
  })
const exitEditMode = () => {
  fetch(`/api/reset-preview`).then(() => {
    window.location.reload()
  })
}
const YourLayout = ({ Component, pageProps }) => {
  return (<OpenAuthoringProvider
      authenticate={() => authenticate('/api/create-github-access-token')}
      enterEditMode={enterEditMode}
      exitEditMode={exitEditMode}>
      {...children}
    </OpenAuthoringProvider>)
}
```

Add error handling to our forms which prompt Github-specific action when errors occur (e.g a fork no longer exists).
```ts
// YourSiteForm.ts
const YourSiteForm = ({ form, children }) => {
  useOpenAuthoringErrorListener(form)
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
import { useOpenAuthoring } from 'react-tinacms-github'
export const EditLink = ({ editMode }: EditLinkProps) => {
  const openAuthoring = useOpenAuthoring()
  return (
    <EditToggleButton
      onClick={
        editMode ? openAuthoring.exitEditMode : openAuthoring.enterEditMode
      }
    >
      {editMode ? 'Exit Edit Mode' : 'Edit This Site'}
    </EditToggleButton>
  )
}
```