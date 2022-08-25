---
title: 'Tina Cloud - A Headless CMS Backed by Git '
date: '2021-04-21T14:06:05-03:00'
author: Scott Gallant
last_edited: '2021-04-22T16:21:48.271Z'
---

We are giving teams the ability to edit content stored in Git, but visually, in the context of their site.

Just over a year ago, we[ announced TinaCMS](https://www.youtube.com/watch?v=iPDCmbaEF0Y), an open-source, visual editor for React-based websites and now we're adding the final touches to bring our vision to reality. In the coming weeks, we’ll release **an open-source GraphQL API for your content** and [Tina Cloud](/blog/tina-cloud-a-headless-cms-backed-by-git/), our new **headless API that talks to Git**.

![Real-time editing of a Next.js + Tailwind CSS site with Tina’s sidebar.](https://res.cloudinary.com/forestry-demo/image/upload/v1619023278/tina-cms-visual-editing.gif 'Real-time editing of a Next.js + Tailwind CSS site with Tina’s sidebar.')_Real-time editing of a Next.js + TailwindCSS site with Tina’s sidebar._

With TinaCMS you can edit in the context of your site and those content changes get synced with *any* storage solution: a Markdown file in GitHub, an Airtable document, a Google Sheet, or just another headless CMS, etc.

![](/img/blog/Before.png)

This storage-agnostic approach maintains a separation of code and content, and doesn't lock you in to any specific content storage solution.

However, at the same time, this approach adds complexity to the setup process and requires your content editors to authenticate through other means, like GitHub (not always ideal). We wanted to give teams a quicker path to success and richer collaboration features which is why we're building our own backend, Tina Cloud.

## Tina Cloud: a best-in-class API on top of Git

![](/img/blog/After.png)

You can think of Tina Cloud as a headless CMS stripped of the editing interface, which is provided by TinaCMS.

### A GraphQL API for your content

We are big believers in storing your website’s content in the filesystem backed by Git (Markdown, JSON, YAML, etc.). Not just because Git is a widely adopted and [open standard](https://github.com/git/git), but also because it comes out-of-the-box with great content management features like branching, rollbacks, and pull requests. Continuous deployment services like Vercel or Netlify rely on Git and content teams should be able to embrace the very same workflow.

However, Git and the filesystem have limitations when you’re interacting with your content programmatically. That’s why databases exist.

> *Because of the file-based nature of content in a Git-based CMS, there really is no way to guarantee* [_referential integrity_](https://en.wikipedia.org/wiki/Referential_integrity) — [Brian Rinaldi](https://www.stackbit.com/blog/git-based-cms-relationships/)

To overcome these limitations, Tina Cloud provides a GraphQL interface to your repository files where content is stored in open formats like Markdown and JSON. This way you can interact with your repository files like you would a database: define content types, relationships, and query your content with GraphQL.

### Bring visual editing to the whole team with Tina Cloud

The best websites result from collaboration between engineers, designers, writers, and marketers. These people need the ability to work from a single source of truth and Tina Cloud offers a simple **dashboard** for admins to manage sites and collaborators.![Tina Cloud Dashboard: Projects Tab](/img/blog/tina-cloud-dashboard.png 'Tina Cloud Dashboard: Projects Tab')

Tina Cloud provides user management, authentication, and basic roles for your editing team. Give your team members access, even if they don’t have a GitHub account. ✨

## Conclusion

In the future, we’ll look back at clunky, conventional CMSs and wonder why we settled for so long. Content management can be so much better and we intend to show the world what is possible thanks to the whole modern stack. To get there, we are leaning into visual editing and Git-backed content.

We believe in portability, which is why our headless CMS stores your content in open-specification file formats in a repository that _you_ control. Also, we are still very committed to TinaCMS’s storage-agnostic approach and Tina Cloud will be one of the many backend storage solutions available to you.
Tina Cloud is the foundation we need to show the world how powerful Git-backed, visual content management can be.

**Public Beta**

> _Tina Cloud is currently in _[_public beta_](/blog/tina-is-in-beta/)_, _[_sign up_](https://app.tina.io)_ to get started with Next.js._
