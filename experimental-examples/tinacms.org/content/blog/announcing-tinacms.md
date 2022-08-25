---
title: 'Announcing TinaCMS '
date: '2019-10-16T07:00:00.000Z'
author: Scott Gallant
draft: false
prev: null
next: content/blog/creating-markdown-drafts.md
---

<Youtube embedSrc={"https://www.youtube.com/embed/iPDCmbaEF0Y"} />

Today, we’re excited to announce [TinaCMS](https://github.com/tinacms/tinacms): an open-source site editing toolkit for React-based sites (Gatsby and Next.js).

Tina is not a CMS, in the traditional sense. As in, it’s not a _separate_ system for managing content. Instead, Tina adds editing functionality to your site when running in dev mode locally, or when using [Tina Teams](http://tinacms.org/teams) (cloud)...In fact, I'm writing this post with Tina right now:

![tina-announcement-gif](https://res.cloudinary.com/forestry-demo/image/upload/v1571244588/tina-cms-announcement-post.gif)

When you install Tina, your site gets a floating _edit_ icon in the corner that toggles an editing pane (left) to expose the CMS fields. This gives your content editors a contextual editing experience that’s super intuitive. When you click "Save" Tina writes your content to external data sources, such as markdown or json files. Try the [Gatsby starter site](https://tinacms.org/guides/gatsby/adding-tina/project-setup) to see for yourself.

### Where does Tina store my content?

Currently, Tina writes to Markdown and data files and commits to Git but it can be extended to write to other data sources (think, a WordPress database, Google Sheets, Airtable, etc). When running locally, Tina writes to the file system and if you're using [Tina Teams](http://tinacms.org/teams), it commits to your GitHub /GitLab repo.

### Why Tina?

I’ve been setting up content management systems for people since the early 2000’s. In the beginning, CMSs like WordPress and Drupal gave our non-developer colleagues website editing powers. But we’ve seen very little innovation on the editing experience in the past 10+ years. Meanwhile, the editing experience of site builders like Squarespace, Wix and Webflow have become very sophisticated.

When I watch people use a traditional CMS, I often see them struggle because the input (the CMS) lacks the context of the output (their site) and using a CMS feels more like filing your taxes than editing a website. Now that we’ve moved to headless CMSs and the JAMstack, editors often lose the ability to preview, leaving them in the dark as they create content.

We developers have hot-reloading, and Tina is the hot-reloading for content editors.

### Get Started

We're coming out of a monolithic CMS era and we believe next-gen sites need a next-gen CMS. Checkout Tina and let us know what you think!

- [TinaCMS Docs](https://tinacms.org/docs/getting-started/introduction)
- [TinaCMS GitHub repo](https://github.com/tinacms/tinacms)
- [Tina Forum](https://community.tinacms.org/)
