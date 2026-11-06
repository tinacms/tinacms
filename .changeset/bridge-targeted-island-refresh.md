---
"@tinacms/bridge": minor
---

Refresh only the islands an edit affects. The island endpoint now lists the forms each island used in `data-tina-island-forms`, and the bridge re-fetches an island only when one of those forms changes. Islands without the list (older adapters, or before their first refresh) are refreshed as before. The bridge also ignores an `updateData` identical to that form's previous one (the admin re-sends every open form on each change), and coalesces the burst of updates the admin sends when it opens into one pass. On a page with a post and a shared header and footer, opening the editor now costs 3 island requests instead of 9, and each edit to the post 1 instead of 3.
