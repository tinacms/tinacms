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

const github = new GithubClient({
  proxy: '/api/proxy-github',
  authCallbackRoute: '/api/create-github-access-token'
  clientId: process.env.GITHUB_CLIENT_ID,
  baseRepoFullName: process.env.REPO_FULL_NAME // e.g: tinacms/tinacms.org,
})

const cms = new TinaCMS({
  apis: {
    github
  },
  media: {
    store: new GithubMediaStore(github)
  }
})
```

### Managing "edit-mode" state

Add the root `TinacmsGithubProvider` component to our main layout. We will supply it with handlers for authenticating and entering/exiting edit-mode.

In this case, we will hit our `/api` server functions.

```tsx
// YourLayout.ts
import { TinacmsGithubProvider } from 'react-tinacms-github';

const enterEditMode = async () => {
  const token = localStorage.getItem('tinacms-github-token') || null
  const headers = new Headers()

  if (token) {
    headers.append('Authorization', 'Bearer ' + token)
  }

  const response = await fetch(`/api/preview`, { headers })
  const data = await response.json()

  if (response.status === 200) {
    window.location.reload()
  } else {
    throw new Error(data.message)
  }
}

const exitEditMode = () => {
  return fetch(`/api/reset-preview`).then(() => {
    window.location.reload()
  })
}

const YourLayout = ({ error, children }) => {
  return (
    <TinacmsGithubProvider
      onLogin={enterEditMode}
      onLogout={exitEditMode}
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

### Enabling the CMS


We will need a way to enable the CMS from our site. Let's create an "Edit Link" button.

```tsx
//...EditLink.tsx
import { useCMS } from 'react-tinacms-github'


export const EditLink = () => {
  const github = useCMS()

  return (
    <button onClick={() => cms.toggle()}>
      {cms.enabled ? 'Exit Edit Mode' : 'Edit This Site'}
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



## Toolbar and form plugins

### Github Delete Action

This is a delete action for [the github client](https://tinacms.org/docs/packages/github-client).

It will **delete the entire form file**. So the primary use case would be dynamic pages like blog pages or docs pages. (Commonly used with markdown files but could be any file format)

![](https://tinacms.org/img/delete-action-ex.png)


#### Options

```ts
interface options {
  getTitle?: (form: Form) => string
  getFilePath?: (form: Form) => string
}
```

| Option      | Description                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| getTitle    | This function takes in the form as its parameter and returns the title that will displayed in the delete action _(Optional)_                      |
| getFilePath | This function takes in the form as its parameter and returns the github file path that will be used when deleting the file in github _(Optional)_ |

#### Example

```js
import { CreateGithubDeleteAction } from 'tinacms-react-github'
//...

const deleteAction = CreateGithubDeleteAction()
const formOptions = {
  label: 'Edit blog post',
  actions: [deleteAction],
  //...
}
```

Or if you want to change the title displayed in the modal

```js
import { CreateGithubDeleteAction } from 'tinacms-react-github'
//...

const deleteAction = CreateGithubDeleteAction({
    getTitle: (form)=>{
        return form.values.frontmatter.title
    },
})
const formOptions = {
   label: "Edit blog post",
   actions: [deleteAction],
   fields: [
     {
       name: "frontmatter.title",
       label: "Title",
       component: "text",
     },
     //...
}
```