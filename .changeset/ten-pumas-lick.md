---
"create-tina-app": patch
---

Add a diagnostic error for GitHub API rate-limit failures when downloading a template, so the cause is identifiable instead of surfacing as the generic "Repository information not found." message.
