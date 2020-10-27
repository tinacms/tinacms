# react-tinacms-github

This package provides helpers for setting up TinaCMS to use the Github OAuth API.

## Installation

```
npm install --save react-tinacms-github
```

or

```
yarn add react-tinacms-github
```


## _GithubClient_

The `GithubClient` class is used to interact with the GitHub API on the frontend, and is intended to be registered with the CMS as an [External API](https://tinacms.org/docs/apis). `GithubClient` takes an object of configuration data with the following structure:

```ts
interface GithubClientArgs {
  proxy: string             // URL to the API Proxy (see next-tinacms-github for an example)
  authCallbackRoute: string // OAuth Callback URL (see next-tinacms-github for an example)
  clientId: string          // Client ID for GitHub OAuth App
  baseRepoFullName: string  // Path to the GitHub repo where content is stored in the format {user}/{repo}, e.g. tinacms/tinacms.org
}
```

We can create and register an instance of `GithubClient` as follows:

```ts
import { TinaCMS } from 'tinacms'
import { GithubClient } from 'react-tinacms-github'

const githubClient = new GithubClient({
  proxy: '/api/proxy-github',
  authCallbackRoute: '/api/create-github-access-token'
  clientId: process.env.GITHUB_CLIENT_ID,
  baseRepoFullName: process.env.REPO_FULL_NAME
})

const cms = new TinaCMS({
  apis: {
    github: githubClient // equivalent to cms.registerApi('github', github)
  }
})
```

### Available Properties

| property | descripton |
| --- | --- |
| `isFork` | Returns `true` if the repo being edited was forked from the base repo configured for the site. |
| `workingRepoFullName` | The full name of the repo currently being edited (will refer to the fork if `isFork` is `true`) |
| `branchName` | Name of the branch currently being edited

### Available Methods

> See also the [GithubFile](#githubfile-and-usegithubfile) for easier-to-use wrappers around `commit` and `fetchFile`.

| method | description |
| --- | --- |
| `async commit(filePath, sha, fileContents, commitMessage)` | Creates a new commit |
| `async fetchFile(filepath, decoded)` | Retrieves the contents of a file from the currently edited repo and branch |
| `async getDownloadUrl(path)` | Returns a URL to download the specified file; used to display images in the CMS |
| `async upload(path, contents, commitMessage, encoded)` | Uploads a file |
| `async delete(path, commitMessage)` | Deletes a file |
| `async isAuthenticated()` | Returns `true` if the user has been authenticated with GitHub, `false` otherwise |
| `async isAuthorized()` | Returns `true` if the logged-in user has permission to push to the repository, `false` otherwise |
| `async getUser()` | Retrieves data about the currently logged-in user |
| `async getRepository()` | Retrieves data about the currently edited repository. |
| `async createFork()` | Forks the base repo |
| `async createPR(title, body)` | Creates a new pull request against the base repo |
| `setWorkingRepoFullName(name)` | Changes the current repo being edited |
| `setWorkingBranch(branch)` | changes the current branch being edited |
| `async fetchExistingPR()` | Retrieves data about an open pull request for the current fork/branch if it exists |
| `async getBranchList()` | Retrieves a list of all branches in the current repo |
| `async createBranch(name)` | Creates a new branch |

## _useGithubClient_


`useGithubClient` returns the `GithubClient` instance registered with the CMS.

```ts
function useGithubFile(): GithubClient
```

```ts
import { useGithubClient} from 'react-tinacms-github'

export function Page(props) => {
  const github = useGithubClient()

  React.useEffect(() => {
    console.log("Reading content from ", github.branchName)
  },[])

  //...
}
```

## _GithubMediaStore_

`GithubMediaStore` is used to manage media over the Github API, and satisfies [the MediaStore interface](https://tinacms.org/docs/media#creating-a-media-store). `GithubMediaStore` should be passed an instance of `GithubClient` when it is created:

```ts
import { TinaCMS } from 'tinacms'
import { GithubClient, GithubMediaStore } from 'react-tinacms-github'

const githubClient = new GithubClient({
  proxy: '/api/proxy-github',
  authCallbackRoute: '/api/create-github-access-token'
  clientId: process.env.GITHUB_CLIENT_ID,
  baseRepoFullName: process.env.REPO_FULL_NAME
})

const mediaStore = new GithubMediaStore(githubClient)

const cms = new TinaCMS({
  apis: {
    github: githubClient // equivalent to cms.registerApi('github', githubClient)
  },
  media: mediaStore
})
```

### Image formats for preview

Currently, the media manager and GitHub media store only supports previews for image files of the following formats: '.jpg', '.jpeg', '.png', '.webp', '.svg'. Other file types will show a file icon instead of an image preview in the media manager. 

## Authentication

> For a detailed guide on setting up authentication with react-tinacms-github on a Next.js site, take a look at our [Next.js + GitHub guide](https://tinacms.org/guides/nextjs/github/initial-setup).


### _TinacmsGithubProvider_

The `TinacmsGithubProvider` component controls edit access to your site and will send unauthenticated users through the authentication flow.

`TinacmsGithubProvider` can be configured with custom handlers that run after a user has logged in / logged out successfully. The below example uses custom `onLogin` / `onLogout` handlers to hit custom API routes that trigger Next.js Preview Mode:

```tsx
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

### _useGithubAuthRedirect_

GitHub's OAuth flow involves redirecting a user to a page on your website that will receive their authentication token payload. The `useGithubAuthRedirect` hook can be used to automatically receive this payload and make it available to the GitHub Client.

```tsx
// pages/github/authorizing.tsx
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

## Using GitHub Forms

Any forms that we have on our site can be created with the `useGithubJsonForm` or `useGithubMarkdownForm` helpers.

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

`useGithubJsonForm` requires the `GithubClient` api to be registered with the CMS on the `github` namespace.

## GitHub Delete Action

This is a delete action for the GitHub client.

It will **delete the entire form file**. So the primary use case would be dynamic pages like blog pages or docs pages. (Commonly used with markdown files but could be any file format)

![Form Actions panel with Delete button](https://tinacms.org/img/delete-action-ex.png)


### Options

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

### Example

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

## _GithubFile_ and _useGithubFile_

The `GithubFile` class is a helper class to provide methods for manipulating a single file in your GitHub repo.

### Signature

The `GithubFile` constructor takes four parameters: `cms`, `path`, `parse`, and `serialize`.

| argument | description |
| --- | --- |
| cms | An instance of TinaCMS |
| path | Filepath, relative to repository root |
| parse | Function to deserialize file contents into an object |
| serialize | Function to serialize data object into a string |

### Methods

The `GithubFile` class has two public methods:

| method | description |
| --- | --- |
| fetchFile | Wraps `GithubClient#fetchFile`; async function to retrieve file contents from GitHub API |
| commit | Wraps `GithubClient#commit`; async function to commit changes to a file |



### Usage Example

```ts
import { GithubFile } from 'react-tinacms-github'

async function example() {
  const navigationFile = new GithubFile(
    cms,
    'content/navigation.json',
    JSON.parse,
    JSON.stringify
  )

  // get file contents from GitHub
  const navigation = await navigationFile.fetchFile()

  // modify the file data
  navigation.push({ url: 'https://tinacms.org', title: 'TinaCMS' })

  // commit the updated file data
  await navigationFile.commit(navigation, 'Update navigation')
}

```

### _useGithubFile_

`useGithubFile` wraps the `GithubFile` class and is designed to be used from inside a Function Component.

```ts
interface UseGithubFileArgs {
  path: string
  parse?: parseFn
  serialize?: serializeFn
}

function useGithubFile(args: UseGithubFileArgs): GithubFile
```

`useGithubFile` is intended to provide a more flexible abstraction than the form helpers, giving you file manipulation methods that you can use in conjunction with `useForm`.

```ts
import { useGithubFile } from 'react-tinacms-github'
import { useForm, usePlugin } from 'tinacms'

export function Page(props) => {

  const { fetchFile, commit } = useGithubFile({
    path: 'content/home-page.json',
    parse: JSON.parse,
    stringify: JSON.stringify
  })

  const [homepageData, homepageForm] = useForm({
    loadInitialValues: fetchFile,
    onSubmit: commit,

    id: 'home-page',
    label: 'Home Page',
    fields: [
      //...
    ],
  })
  usePlugin(homepageForm)

  //...
}
```

## Events and Alerts

The `GithubClient` defines several events:

| Event Name | Description |
| --- | --- |
| `github:commit` | A commit has been made to a file. |
| `github:error` | An error was encountered when interacting with the GitHub API. |
| `github:branch:checkout` | The client switched to a new branch. |
| `github:branch:create` | A new branch was created in GitHub. |

### Alerts

| Event | Level |  Default Message |
| --- | --- | --- |
| `github:commit` | Success | `Saved Successfully: Changes committed to {repo}` |
| `github:branch:checkout` | Info | `Switched to branch {name}`|
