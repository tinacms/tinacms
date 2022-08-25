---
title: Updated Next.js Docs + Deprecating tina-git-server
date: '2019-12-06T07:00:00.000Z'
author: DJ Walker
draft: false
next: content/blog/dynamic-plugin-system.md
prev: content/blog/using-tinacms-with-nextjs.md
---

We've changed our recommended approach for using Tina's Git Backend with Next.js websites. Check out [Tina's Next.js documentation](/guides/nextjs/git/adding-backend) for details.

To make it easy to use Tina's backend plugins, they are designed as Express middleware. These can be easily attached to Gatsby's dev server by implementing Gatsby's `onCreateDevServer` method and adding a few lines of connecting code. We reasoned that we could attach the same middleware to the dev server in other frameworks, allowing us to run the same backend code without having to rewrite it for each framework we intend to support.

With Next.js, the lack of a plugin system requires developers to write a bit more code in order work with Tina. In order to use Express middleware with a Next.js site, a developer can do one of two things:

1. Create a standalone Express app to use the middleware, or
2. Write a [custom server](https://nextjs.org/docs#custom-server-and-routing) to run the site, creating an Express server and attaching the middleware in the process.

We previously settled on solution 1 in order to maximize compatibility with any existing Next.js sites; otherwise, anyone already using a custom server with Next.js and not using Express may have a harder time integrating the two together. This led to the creation of the `tina-git-server` command.

The main issue with solution 1 is that, while middleware is a convenient way to "plug in" server code in the absence of a proper plugin system, these middleware "plugins" could only control _other plugins_. There is no way, in this system, to attach middleware that could exert any control over the website itself. We were originally OK with this limitation, but when strategizing about possible **access control** features, we decided this solution was inadequate.

Ultimately, solution 2 is both simpler and more robust. Although it requires more work on the end of the developer using Tina, this is often a side effect of software that properly [inverts control](https://kentcdodds.com/blog/inversion-of-control/).
