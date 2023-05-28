---
'@tinacms/datalayer': patch
'@tinacms/graphql': patch
'@tinacms/cli': patch
---

This adds a GithubBridge in order to better support separate content repositories for self-hosted projects. This will also help provide a path to better support reindexing for self-hosted projects (i.e. keeping the data layer updated when changes are pushed directly via git, rather than made through the Tina UI). See further notes in this discussion: https://github.com/tinacms/tinacms/discussions/3589#discussioncomment-4960323 and this issue: https://github.com/tinacms/tinacms/issues/3609
