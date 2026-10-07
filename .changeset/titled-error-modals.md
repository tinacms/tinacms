---
'tinacms': patch
'@tinacms/app': patch
---

Error modals now show their own title in the header, size the action button to its label, and link to the TinaCloud troubleshooting guide with descriptive text. `ErrorDialog` now renders as modal content instead of a standalone styled card, and its `title` prop is deprecated in favour of `cms.alerts.error(message, { title })`.
