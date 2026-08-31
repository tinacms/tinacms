---
"@tinacms/schema-tools": patch
"@tinacms/cli": minor
"tinacms": patch
---

Make the image field's `accept` work on `list: true` fields, and filter by extension server-side everywhere. The list variant built each item input from a bare `{component: 'image'}`, so a gallery got no dropzone restriction and no insert guard. The local dev server now accepts an `ext` param on `/media/list`, filtering before it paginates, so the media manager's type filter no longer narrows a page after the fact. A `staticMedia` store reports no extension filtering and hides the control rather than showing one that would leave a near-empty grid.
