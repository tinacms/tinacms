---
"tinacms": minor
---

Extend the Media Manager's Rename action to TinaCloud repo-based media.

Rename previously appeared only in local development. `TinaMediaStore` now implements it against the assets API too, so editors can rename repo media on a deployed site instead of deleting and re-uploading. Static and self-hosted repo-media stores still do not advertise the action.

How a rename is applied depends on the branch:

- On an unprotected branch, the rename is written directly and staged like any other media change.
- On the media branch, when it is unprotected, the rename is written directly to the production media.
- On a protected branch, when editorial workflow is enabled, the rename goes through the editorial workflow: you are prompted for a branch, and the rename lands there with a pull request targeting the branch you were on. This applies to the protected media branch and to any other protected branch. "Save to Protected Branch" is not offered for these renames, because a rename on a protected branch always goes through the workflow. Uploads and deletes are unchanged and still offer it.

Renaming still does **not** update content that already references the old path — the modal continues to say so.

Errors from the assets API are reported specifically rather than generically: collisions, missing files, invalid names and permission problems each get their own message, and the API's own explanation is shown when it has one.
