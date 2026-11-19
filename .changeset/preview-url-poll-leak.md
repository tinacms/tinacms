---
'tinacms': patch
---

Stop the visual editor's preview URL poll from outliving the component. Each mount started a 100ms interval that was never cleared, so navigating within the admin left every earlier interval running and reading the preview frame's location.
