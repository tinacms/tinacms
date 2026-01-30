# Investigation Report: Media Manager Architecture

## Problem Statement

- Architectural overview of Media Manager implementation (full stack - frontend + backend)
- Focus on TinaCloud media storage specifically
- Goal: Feature development - adding search functionality
- Need all configuration values and their locations
- Identify code paths that touch Media Manager

---

## High-Level Summary

The TinaCMS Media Manager is a modular system with clear separation between:

1. **Frontend Layer** - React components in `@tinacms/toolkit` providing a modal-based file browser with grid/list views, drag-and-drop upload, and infinite scroll pagination

2. **Core Orchestration** - A `MediaManager` class that coordinates between UI and storage, with an event-driven architecture for upload/delete/list operations

3. **Storage Abstraction** - A `MediaStore` interface implemented by `TinaMediaStore` for TinaCloud, with authenticated API calls to `assets.tina.io`

4. **Backend API** - REST endpoints in the CLI dev server handling list/upload/delete operations, with polling for async cloud operations

**For search functionality**, the key integration points are:
- `MediaListOptions` interface (add search parameter)
- `TinaMediaStore.list()` method (pass search to API)
- `media-manager.tsx` UI (add search input)
- Backend list handlers (filter by query)

---

## Detailed Findings

### 1. Frontend Components

**Location:** `packages/tinacms/src/toolkit/components/media/`

| File | Purpose | Key Exports |
|------|---------|-------------|
| `media-manager.tsx` | Main container & picker | `MediaManager`, `MediaPicker` |
| `media-item.tsx` | Individual item rendering | `ListMediaItem`, `GridMediaItem` |
| `breadcrumb.tsx` | Directory navigation | `Breadcrumb` |
| `modal.tsx` | Delete/New folder dialogs | `DeleteModal`, `NewFolderModal` |
| `pagination.tsx` | Cursor-based pagination | `CursorPaginator` |
| `copy-field.tsx` | Copy URL utility | `CopyField` |
| `utils.ts` | Helper functions | `DEFAULT_MEDIA_UPLOAD_TYPES`, `isImage`, `isVideo` |

**Key UI State (in `MediaPicker`):**
```typescript
listState: 'loading' | 'loaded' | 'error' | 'not-configured'
list: MediaList              // Current items + nextOffset
directory: string            // Current path
activeItem: Media | false    // Selected item for preview
viewMode: 'grid' | 'list'    // Display toggle
uploading: boolean           // Upload in progress
```

**Search Integration Point:** Add search input to toolbar area in `media-manager.tsx` around line 200-250 (near view toggle and refresh button).

---

### 2. Core Media Manager Class

**Location:** `packages/tinacms/src/toolkit/core/media.ts`

```typescript
class MediaManager {
  store: MediaStore           // Storage implementation
  events: EventBus            // Event dispatcher
  _pageSize: number = 36      // Items per page

  // Key methods
  open(options: SelectMediaOptions): void
  persist(files: MediaUploadOptions[]): Promise<Media[]>
  list(options: MediaListOptions): Promise<MediaList>
  delete(media: Media): Promise<void>
}
```

**Event Types:**
- `media:open` - Modal opened
- `media:upload:start/success/failure`
- `media:delete:start/success/failure`
- `media:list:start/success/failure`

---

### 3. TinaCloud Media Store

**Location:** `packages/tinacms/src/toolkit/core/media-store.default.ts`

**Class:** `TinaMediaStore implements MediaStore`

**API Endpoints (Cloud Mode):**

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List | GET | `/media/list/{directory}?limit=X&cursor=Y` |
| Upload (get URL) | GET | `/media/upload_url/{path}` |
| Upload (actual) | PUT | Signed URL from above |
| Delete | DELETE | `/media/{path}` |
| Status polling | GET | `/request-status/{clientId}/{requestId}` |

**Base URL:** `https://assets.tina.io/{clientId}/`

**Authentication:** Uses `authProvider.fetchWithToken()` for all cloud requests.

**Search Integration Point:** Modify `list()` method to accept and pass `searchQuery` parameter to API.

---

### 4. Backend Server Routes

**CLI Dev Server:** `packages/@tinacms/cli/src/server/routes/index.ts`

```typescript
GET  /media/list/*   → List directory contents
POST /media/upload/* → Upload file (multer middleware)
DELETE /media/*      → Delete file
```

**Vite Dev Server:** `packages/@tinacms/cli/src/next/commands/dev-command/server/media.ts`

Uses `MediaModel` class for local filesystem operations.

**Search Integration Point:** Add query parameter handling to list endpoint, filter results by filename.

---

### 5. Configuration Values

#### Schema Configuration
**Location:** `packages/@tinacms/schema-tools/src/validate/tinaCloudSchemaConfig.ts`

```typescript
media: {
  tina: {
    publicFolder: string,   // e.g., "public"
    mediaRoot: string,      // e.g., "uploads"
    static?: boolean        // Read-only mode
  },
  loadCustomStore?: () => Promise<MediaStore>,
  accept?: string | string[]  // Allowed MIME types
}
```

#### Runtime Configuration
**Location:** `packages/tinacms/src/toolkit/core/media.ts`

| Config | Default | Description |
|--------|---------|-------------|
| `pageSize` | 36 | Items per page |
| `maxSize` | 100MB | Max upload size |
| `accept` | See below | Allowed file types |

**Default Accept Types** (`utils.ts`):
```typescript
DEFAULT_MEDIA_UPLOAD_TYPES = [
  'image/*', 'video/*', 'audio/*',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.ppt', '.pptx', '.svg', '.json', '.txt'
]
```

#### TinaCloud Project Settings
**Location:** `packages/tinacms/src/internalClient/types.ts`

```typescript
interface TinaMedia {
  publicFolder: string
  mediaRoot: string
}

interface TinaCloudProject {
  mediaBranch?: string  // Branch for media operations
}
```

---

### 6. Types & Interfaces

**Location:** `packages/tinacms/src/toolkit/core/media.ts`

```typescript
interface Media {
  type: 'file' | 'dir'
  id: string
  filename: string
  directory: string
  src?: string
  thumbnails?: { [name: string]: string }
}

interface MediaListOptions {
  directory?: string
  limit?: number
  offset?: string | number
  thumbnailSizes?: { w: number; h: number }[]
  filesOnly?: boolean
  // SEARCH ADDITION: searchQuery?: string
}

interface MediaList {
  items: Media[]
  nextOffset?: string | number
}

interface MediaStore {
  accept: string
  maxSize?: number
  persist(files: MediaUploadOptions[]): Promise<Media[]>
  delete(media: Media): Promise<void>
  list(options?: MediaListOptions): Promise<MediaList>
  isStatic?: boolean
}
```

---

### 7. Code Paths That Touch Media Manager

#### Upload Flow
```
User drops file
  → MediaPicker.onDrop()
  → cms.media.persist(files)
  → TinaMediaStore.persist_cloud()
  → GET /media/upload_url/{path}  (get signed URL)
  → PUT to signed URL             (actual upload)
  → Poll /request-status          (wait for completion)
  → Return Media object
```

#### List Flow
```
MediaPicker mounts / directory changes
  → cms.media.list({ directory, limit, offset })
  → TinaMediaStore.list()
  → GET /media/list/{directory}?limit=X&cursor=Y
  → Parse response, generate thumbnail URLs
  → Return MediaList { items, nextOffset }
```

#### Delete Flow
```
User clicks delete → confirms
  → cms.media.delete(media)
  → TinaMediaStore.delete()
  → DELETE /media/{path}
  → Poll /request-status (cloud mode)
  → Refresh list
```

---

## Recommendations

### For Adding Search Functionality

#### Option A: Frontend-Only Filtering (Simplest)
**Pros:** No backend changes, quick to implement
**Cons:** Only filters loaded items, won't scale for large libraries

**Changes Required:**
1. Add search input state in `media-manager.tsx`
2. Filter `list.items` before rendering
3. Consider debouncing for performance

#### Option B: API-Level Search (Recommended)
**Pros:** Scales to large libraries, proper pagination with search
**Cons:** Requires backend changes

**Changes Required:**

| Layer | File | Change |
|-------|------|--------|
| Types | `media.ts` | Add `searchQuery?: string` to `MediaListOptions` |
| Store | `media-store.default.ts` | Pass `query` param in API call |
| UI | `media-manager.tsx` | Add search input, trigger list refresh |
| Backend | TinaCloud API | Support `query` parameter (external) |

#### Option C: Hybrid Approach
**Pros:** Best UX - instant local filtering + server search
**Cons:** More complex state management

**Implementation:**
1. Implement frontend filtering immediately on loaded items
2. Add debounced API call for full search
3. Merge/replace results when API returns

### Suggested Implementation Order

1. **Phase 1:** Add search UI component and local filtering
2. **Phase 2:** Extend `MediaListOptions` type with search parameter
3. **Phase 3:** Update `TinaMediaStore.list()` to pass search query
4. **Phase 4:** Coordinate with TinaCloud backend for search support

### Key Files to Modify

| Priority | File | Changes |
|----------|------|---------|
| 1 | `packages/tinacms/src/toolkit/components/media/media-manager.tsx` | Add search input UI |
| 2 | `packages/tinacms/src/toolkit/core/media.ts` | Extend `MediaListOptions` interface |
| 3 | `packages/tinacms/src/toolkit/core/media-store.default.ts` | Pass search param to API |
| 4 | Backend/TinaCloud | Support search parameter |

---

## Appendix: File Reference

### Frontend Components
- `packages/tinacms/src/toolkit/components/media/media-manager.tsx`
- `packages/tinacms/src/toolkit/components/media/media-item.tsx`
- `packages/tinacms/src/toolkit/components/media/breadcrumb.tsx`
- `packages/tinacms/src/toolkit/components/media/modal.tsx`
- `packages/tinacms/src/toolkit/components/media/utils.ts`

### Core Media
- `packages/tinacms/src/toolkit/core/media.ts`
- `packages/tinacms/src/toolkit/core/media-store.default.ts`

### Backend/CLI
- `packages/@tinacms/cli/src/server/routes/index.ts`
- `packages/@tinacms/cli/src/server/models/media.ts`
- `packages/@tinacms/cli/src/next/commands/dev-command/server/media.ts`

### Configuration & Types
- `packages/@tinacms/schema-tools/src/validate/tinaCloudSchemaConfig.ts`
- `packages/tinacms/src/internalClient/types.ts`

### Media Resolution Utilities
- `packages/@tinacms/graphql/src/resolver/media-utils.ts`
