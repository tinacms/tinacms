# Backends

A **backend** for the CMS will specify where content is stored, as well as where the latest version of content is sourced from.

## Backend Modes(?)

### Browser-only

Only needs to run in browser. Can deploy statically and use the CMS.

### Hybrid

Runs browser and server-side code. Need to be running server code (e.g. gatsby devserver) wherever CMS is used

### Server-only (???)

Hooks into local backend to persist changes on save (??? is this a dumb idea)

## Available Backends

- Local
- GitLab

## Creating a Custom Backend

TODO make this interface better or provide multiple interfaces

```typescript
interface Backend {
  onSubmit?(data: any): any
  onChange?(data: any): any
  isAuthenticated?(): any
  authenticate?(): Promise<any>
  removeAuthentication?(): any
}
```

### WIP: Multiple interface types?

```typescript
interface SimpleBackend {
  read(contentPath): Promise<any>
  onChange(contentPath, content): Promise<any>
  onSubmit(contentPath, content): Promise<any> // todo standardize on result format?
  delete(contentPath): Promise<any>
}

interface AuthenticatingBackend extends SimpleBackend {
  isAuthenticated(): boolean
  authenticate(): Promise<any>
  deAuthenticate(): Promise<any>
}

interface HybridBackend extends SimpleBackend {
  start(): Promise<any>
}
```

```typescript
import { AuthenticatingBackend } from '@forestryio/cms'

export class CustomBackend implements AuthenticatingBackend {
  authenticate() {}
  deAuthenticate() {}
  isAuthenticated() {}
  read(contentPath) {}
  onInput(contentPath, content) {}
  persist(contentPath, content) {}
  delete(contentPath) {}
}
```
