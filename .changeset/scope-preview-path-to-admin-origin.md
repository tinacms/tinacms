---
'tinacms': patch
'@tinacms/app': patch
---

The admin preview route now resolves its path against the admin's own origin. When the resolved value points elsewhere the preview stays on the site root, raises a warning, and replaces the rejected address in history so neither the address bar nor the back button keeps pointing at the other site.

The origin trusted for the admin-to-preview message channel is now the admin's own origin rather than one derived from the preview URL, so a URL cannot nominate the origin it is then trusted from.

The active-field lookup also guards against a preview whose document it cannot read (a cross-origin or sandboxed frame), where it previously threw and unmounted the admin.
