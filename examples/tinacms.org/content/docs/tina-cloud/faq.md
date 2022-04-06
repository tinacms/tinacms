---
title: Tina Cloud FAQ
last_edited: '2022-01-24T15:50:19.525Z'
---
## What's the difference between Tina Cloud and TinaCMS?

TinaCMS is an open source toolkit that enables developers to create a live editing experience on their site.

Tina Cloud adds a GraphQL API to Tina's open-source content editor allowing it to read and write content stored in your Github repository (ie. Markdown and soon JSON). It also grants authorization for other users (content creators, editors, marketers, etc) to login and edit their site without needing to grant direct access to the repository in GitHub

## Where do I start?

* Have a look at the updated [Tina Cloud docs](/docs/setup-overview/) and try out a starter.
* [Sign up for Tina Cloud](https://app.tina.io/register)!
* [Find us on Discord](https://discord.com/invite/zumN63Ybpf)

## What do I need to know about working with the current release of Tina Cloud?

Since this is an early release you should expect to run into bugs occasionally or be required to update your code because of API improvements.

These features are not (yet) included in Tina Cloud and you might miss them:

* A multi-branch workflow
* The GraphQL API for your content is not yet queryable with read-only tokens. That means it can only be used while editing content with Tina.

## What technical considerations should I make when working with Tina Cloud?

You'll find success with Tina Cloud if your project includes:

* [Next.js](https://nextjs.org/) - The flexibility of this fantastic React framework dramatically lowers the bar to build with Tina Cloud.
* GitHub - The first Git provider that Tina Cloud integrates with. Other Git providers may be available in the future.
* Static, file-based builds - The Tina Cloud client collects your filesystem content at build time. The ability to fetch content from our cloud API during builds will come soon.

The [Next.js starter](https://github.com/tinacms/tina-cloud-starter) can get you up and running quickly with the above considerations. Give it a try and let us know how we can make developing with Tina easier.

## How can I share an idea or get help using Tina Cloud?

* If you haven't checked yet, the [docs](/docs/) may have the answer you are looking for!
* Connect with us on [Discord](https://discord.com/invite/zumN63Ybpf).
* We can help you at support@tina.io. Email us if you would like to schedule a chat!
* Chat with us from your Tina Cloud dashboard (there's a chat widget on the bottom right of the browser window).

## What is the pricing for Tina Cloud?

There will be no cost for small teams to use Tina Cloud while it is in Beta.

A fair use policy will be coming soon.

We will contact you if we believe your use case may eventually fit within our post-beta paid plans.

## **Does Tina Cloud work with Monorepos?**

It does! Tina Cloud can work with sites inside monorepos by specifying the path to your `.tina` folder in your Project configuration.

If your repo is not a monorepo, there's no need to do any configuration. We'll expect your `.tina` folder at the root of your repo.

Here's an example monorepo structure that works with Tina Cloud:
```
    /projects/site-a
    /projects/site-b
    /projects/site-c
```

## How do I resolve the `Unable to find record '.tina/__generated__/_graphql.json'` error?

Tina Cloud's GraphQL API returns this error when it cannot find a file in your GitHub repository. This may occur under the following circumstances:

- The `.tina` folder (and `__generated__` subfolder) is not in your GitHub repository remote.
  - If the folder is in your local repository, but not in your remote, make sure there isn't a `.gitignore` file excluding it.
- Tina is configured with a branch that doesn't exist or a branch that doesn't contain the `.tina` folder.
  - The referenced branch should be created and should contain the `.tina` folder.
- The apiURL prop is misconfigured on the TinaCMS component.
  - Check the apiURL and make sure it looks like `https://content.tinajs.io/content/{tina_client_id}/github/{branch}` where `{tina_client_id}` matches the Client ID on the Project in Tina Cloud and `{branch}` is a valid branch.

## Tina.io login window doesn't close when logging in from a site

When a user logs in from your site, we will pop open a login window. When login is complete, we will attempt to send a message back to the main window.

The most common reasons for this issue are:

* The Site URL is not properly set for the Tina project. The main window's base URL will need to match the Tina project's Site URL setup in the Tina Cloud Dashboard.
* The Client ID setup in your site's environment variables does not match the Client ID in your project's settings on the Tina Cloud dashboard.
* The user attempting to login to Tina Cloud does not have access to edit this site. Ensure that this user is authorized on the Tina Cloud dashboard.

> Make sure to include `https` in the Site URL eg: https://forestry.io or if you are testing locally, it might be something like `http://localhost:3000`
