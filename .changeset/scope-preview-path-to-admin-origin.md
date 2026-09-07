---
'tinacms': patch
---

The admin preview route now resolves its path against the admin's own origin. When the resolved value points elsewhere the preview stays on the site root, raises a warning, and replaces the rejected address in history so neither the address bar nor the back button keeps pointing at the other site. This keeps the preview iframe, and the message channel the admin opens to it, on a single known origin.

The active-field lookup also guards against a preview whose document it cannot read (a cross-origin or sandboxed frame), where it previously threw and unmounted the admin.
