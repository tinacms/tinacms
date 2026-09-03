---
"tinacms": minor
---

Add TinaCloud media rename support to the Media Manager.

Repo-backed media can now be renamed directly from the Media Manager. Renames on unprotected branches are applied directly, while renames on protected branches use the editorial workflow and create a pull request from a new workflow branch.

Local media rename behavior is unchanged, and static or self-hosted repo media stores still do not expose the Rename action.

Renaming does not update existing content references to the old media path. Rename failures from the assets API are surfaced in the UI with their specific error messages.
