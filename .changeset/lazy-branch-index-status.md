---
"tinacms": patch
---

Load branch index statuses lazily. Opening the branch switcher used to request and poll the index status of every branch in the repository, so a project with hundreds of branches produced thousands of requests. The list now loads without statuses and fetches them only for the current branch and the rows on screen, a few at a time, polling only those rows while they index. The remaining statuses load at the same capped rate when the Last Updated sort is selected. Both the table switcher and the legacy switcher use the new loader.
