# Xeditor GitLab Backend

The GitLab backend persists your content changes to GitLab using the GitLab v4 API.

## Requirements

A GitLab OAuth app whose redirect URI ends in `?auth-gitlab`

## Usage

Gitlab implements the [`AuthenticatingBackend` interface](../concepts/backends.md).

### 1. Register the backend

```typescript
import { GitlabBackend } from '@forestryio/cms-backend-gitlab'

let gitlab = new GitlabBackend({
  apiBaseURI: "https://gitlab.com/" // optional
  appID: "APP-ID",
  redirectURI: "REDIRECT-URI/?auth-gitlab"
  repositoryID: "username/reponame"
})
cms.registerBackend('gitlab', gitlab)
```

### 2. Bootstrap the authenticator

The GitLab backend needs to listen for GitLab's OAuth response. To do this, call the backend's `boostrap()` method somewhere on the frontend that will execute when your app's redirect URI is loaded.

```typescript
gitlab.bootstrap()
```

### 4. Handle login

```typescript
if (!gitlab.isAuthenticated()) {
  gitlab.authenticate()
}
```

### 5. Save changes on submit

```typescript
gitlab.onSubmit('/path/to/content.md', '# Hello World')
```

## Related Topics

- [Backends](../concepts/backends.md)
