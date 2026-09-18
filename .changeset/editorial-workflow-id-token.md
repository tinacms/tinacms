---
'tinacms': patch
---

Send the same TinaCloud token from every CMS request. Editorial workflow requests preferred the access token while content requests preferred the ID token, and TinaCloud reads the editor's email from the ID token, so "Save to new branch" failed with "Failed to complete workflow. Please try again." and left an empty branch behind. Both paths now share one helper that prefers the ID token and falls back to the access token, which is what versions before 3.12.1 sent. Ordinary saves are unchanged.
