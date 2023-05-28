# TinaCMS GitHub Bridge

This package provides a `GithubBridge` for [TinaCMS](https://tina.io/) in order to better support separate content repositories for self-hosted projects.

This will also help provide a path to better support reindexing for self-hosted projects (i.e. keeping the data layer updated when changes are pushed directly via git, rather than made through the Tina UI)

**See the example usage in the `tina/database.ts` file within the `[examples/tina-self-hosted-demo](https://github.com/tinacms/tinacms/blob/main/examples/tina-self-hosted-demo/tina/database.ts)`**

## Background

See the background notes in this discussion thread: https://github.com/tinacms/tinacms/discussions/3589#discussioncomment-4960323 and the further details in this issue: https://github.com/tinacms/tinacms/issues/3609, including this video overview of the key components to consider: https://www.loom.com/share/c7d1c4f5bda04ec3a1dacff2a03efac1

This package draws heavily from the original `GithubBridge` that previously existed within the `@tinacms/datalayer` package - i.e. [this historical file](https://github.com/tinacms/tinacms/blob/930260c839cbd1908e9e6902734c94f6d64d3282/packages/%40tinacms/datalayer/src/database/bridge/github.ts) that was removed in [this commit](https://github.com/tinacms/tinacms/commit/fb74f4a129164e3b40ff7cd38928682dadab945c)

Introduced in this PR: https://github.com/tinacms/tinacms/pull/3936
