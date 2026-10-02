---
'tinacms': patch
---

The branch switcher now shows an error alert when creating a branch fails, instead of leaving the loading spinner up with the error only in the console. The alert uses the message returned by the server (for example, why a branch name was rejected), and the branch list becomes usable again so the name can be corrected and retried.
