---
'@tinacms/app': patch
---

Session expiry during a visual-editing save no longer paints the generic "There was a problem saving your document" dialog over the login modal; the save handler now lets `SessionExpiredError` pass through like the admin's other save paths.
