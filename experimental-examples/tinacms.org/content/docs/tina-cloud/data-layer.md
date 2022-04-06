---
title: Data Layer
last_edited: '2022-02-15T20:00:00.000Z'
---

{{ WarningCallout text="This is an experimental feature, and the API is subject to change. Have any thoughts? Let us know in the chat, or through one of our [community channels](/community/)!" }}

Tina Cloud now supports an optional Data Layer which implements a database layer between the Tina GraphQL API and the
GitHub REST API. This data layer buffers requests between Tina Cloud and GitHub resulting in improved editing
performance with TinaCMS. As this feature evolves, it will provide additional capabilities such as:
- more sophisticated GraphQL queries
- referential integrity
- sorting
- filtering
- pagination 

# Enabling the Data Layer

The TinaCMS data layer is enabled by specifying the following TinaCMS command line flag: `--experimentalData`. We
recommend editing the script(s) in your site's package.json to pass the flag:

```json
"start": "yarn tinacms server:start -c \"next start\" --experimentalData"
```

Once the flag is added and the TinaCMS CLI is executed using the flag, the generated schema will be updated. **These
updates must be committed and pushed to the remote GitHub repository in order to activate the data layer.**

# Indexing

Once the data layer is enabled, Tina Cloud will automatically maintain a synchronized copy of your repository in our
secure cloud database. We refer to this synchronization process as indexing. It involves fetching each item from your
GitHub remote repository and storing a copy in the database. After the initial indexing process, Tina Cloud will only
index content that has been updated. There are some circumstances where a full re-indexing may be required. Some example
scenarios are:
- Changes to `.tina/schema.ts`
- Changes to the [path to tina](/docs/tina-cloud/faq/#does-tina-cloud-work-with-monorepos)
- Changes to the configured [repository](/docs/tina-cloud/dashboard/projects/#changing-the-repository)
- New branches in GitHub

# Caveats

There are some issues to be aware of when using the data layer: 

- The status of the indexing process is not currently exposed to the end user, so it is possible for an editor to access
a partially indexed site, in which case any queries may return with incomplete results.
- Since the GitHub API currently only allows 5,000 requests per repository per hour, any repositories with large numbers
of items may not be able to complete indexing before hitting the limit. For this reason, this feature should not be
activated for repositories with more than 1000-1500 items.

These issues will be addressed before this feature becomes the default for Tina Cloud.
