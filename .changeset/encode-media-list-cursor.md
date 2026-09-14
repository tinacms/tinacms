---
'tinacms': patch
---

URL-encode the pagination cursor in the media list request, so folders whose cursor contains a reserved character load every page instead of repeating the first one.
