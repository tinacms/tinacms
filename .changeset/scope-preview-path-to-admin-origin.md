---
'tinacms': patch
---

The admin preview route now resolves its path against the admin's own origin. When the resolved value points elsewhere the preview stays on the site root and raises a warning, instead of following the link. This keeps the preview iframe, and the message channel the admin opens to it, on a single known origin.

The active-field lookup also guards against a preview whose document it cannot read (a cross-origin or sandboxed frame), where it previously threw and unmounted the admin.
