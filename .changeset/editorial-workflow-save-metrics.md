---
"tinacms": patch
---

Add a PostHog `editorial-workflow-save` event that records which save option was used in the "Save changes to new branch" modal (draft, ready for review, or publish), whether the save succeeded, and the failure reason when it didn't.
