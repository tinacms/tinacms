# Xeditor GitLab Backend

The GitLab backend persists your content changes to GitLab

## Requirements

A GitLab OAuth app whose redirect URI ends in `?auth-gitlab`

## Usage

### 1. Register the backend

```typescript
import { GitlabBackend } from '@forestryio/cms-backend-gitlab'

let gitlab = new GitlabBackend({
  //...
})
cms.registerBackend('gitlab', gitlab)
```

### 2. Bootstrap the authenticator

The GitLab backend needs to listen for GitLab's OAuth response.

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
