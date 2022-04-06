---
title: Moving from Local-Mode to Prod-Mode
id: '/docs/tina-cloud'
next: '/docs/tina-cloud/dashboard'
---

Tina's GraphQL Content API is flexible, in that it can be run locally using the Tina CLI ("Local Mode"), or your site can talk to our hosted content API in a production environment ("Prod Mode"), which persists changes to your GitHub repository.

## Local-Mode

When developers are developing locally, it's often convenient to load/save content from their local filesystem rather than connecting to the content on Tina Cloud.

When in local-mode, you **will not** need to login to enter edit-mode.

{{ WarningCallout text="Note: Local-mode is meant for developing locally, and will not work when your site is hosted on production. When in local-mode, Tina tries to hit `http://localhost:4001`, which isn't available at runtime on your production site (and neither is the underlying filesystem content)." }}

## Prod-Mode

Once you are ready to host your site in production and put editing behind authentication, it's time to connect Tina Cloud.

Tina's Content API authenticates directly with GitHub removing the need for users to create GitHub accounts. Access is granted through the dashboard, allowing users to login directly through your site and begin editing! Any changes that are saved by your editors will be commited to the configured branch in your GitHub repository.

To start moving from local-mode to prod-mode, the next steps are to:
- Push your repository to GitHub (if it isn't already)
- Set up a project in the Tina Cloud dashboard. (See next page)
