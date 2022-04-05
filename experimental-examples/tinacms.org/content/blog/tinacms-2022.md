---
title: TinaCMS in 2022
date: '2022-02-22T00:00:00-04:00'
author: Scott Gallant
last_edited: '2022-02-22T00:00:00-04:00'
opengraph:
  image:
    url: >-
      https://res.cloudinary.com/forestry-demo/image/upload/v1645630893/blog-media/tinacms-2022-vision.png
    width: '1920,'
    height: '1080,'
    alt: 'TinaCMS in 2022'
---

The Tina team is off-to-the races on an exciting year. We’re on a mission to redefine web publishing by making the most hackable CMS on the planet, giving developers complete control over the editing experience for their sites.

Tina has two unique differentiators from other, more traditional, CMSs:

1.  **Git -** We’re big believers in using files (Markdown, MDX, JSON, etc) and Git for content storage
2.  **Contextual Editing -** The best editing experience is contextual, where your content editors can see their changes reflected on their site in real-time

Using Git to store your content is the dream. When your content is in Markdown and JSON files, it simplifies your stack. You get the benefits of structured content wihtout a database. You own your content in _your_ repo, in open-formats, instead of renting space in a 3rd-party database or managing a backend server.  When you use the file system + Git for your content you get version control (history, roll-backs, etc) and a CI/CD-friendly workflow. Most importantly, you gain portability and aren’t locked into any one system. With Git, you’re in control of your site: code and content.

Your content creators don't need to know that - under the hood - Tina is powered by Git. The editing experience shows your content changes in the context of your site, in real-time.  This is the case for every B2C site-builder tool on the market and it’s finally possible now for developer-first, headless CMSs when using modern frameworks like those built on React, Vue, and Svelte. We’re just getting started on what’s possible and we’re seeing teams build platforms that give their teams complete creative control, while giving developers complete control over the code and CMS guide rails.  Having said that, Tina will also offer a basic editing mode for content that isn’t rendered in a view (described below).

Here’s a summary of what’s coming in 2022 with more details below.

![Tina launches version 1. More frameworks (Remix, Nuxt, SvelteKit, etc). A Headless API on top of your Git content. Markdown at scale. New UI. More open and more extendible](https://res.cloudinary.com/forestry-demo/image/upload/v1645630893/blog-media/tinacms-2022-vision.png)

## Tina Goes 1.0

Tina is currently in Beta but we’re steadily progressing toward 1.0.  We expect this to happen relatively soon because we’re seeing more and more people try and fall in love with Tina every day ❤️.

![Community Feedback from Leroy](https://res.cloudinary.com/forestry-demo/image/upload/v1645631378/blog-media/tinacms-community-feedback-leroy.png)
![Community Feedback from Jason Mason](https://res.cloudinary.com/forestry-demo/image/upload/v1645631378/blog-media/tinacms-community-feedback-jason.png)

As Tina approaches 1.0 you will see some rough edges smoothed out like the UX around media management and improved performance when loading content in the CMS. Also, since we’ve been focused on solving the hardest problems first (like scaling Git to thousands of pages) you might have noticed that some functionality is missing, like simply deleting pages.  This functionality will be in place before 1.0 and Tina will be a full-fledged, mature CMS.

## More frameworks (Remix, Nuxt, SvelteKit, etc)

![next.js, remix, nuxt, hugo, eleventy](https://res.cloudinary.com/forestry-demo/image/upload/v1645631638/blog-media/SSG-logos.png)

Tina has been focused on Next.js while in beta. This has reduced our maintenance “surface area” while we get the product right.  Before 1.0, we will open up Tina to other frameworks.  Phase 1 will include modern, data-agnostic, Javascript frameworks like Remix, Nuxt, and SveltKit.  Phase 2 will include all JAMstack frameworks (Jekyll, Hugo, 11ty, etc).

## A Headless API on top of your Git content

As mentioned above, we’re big believers in using Markdown, MDX, and JSON files (under Git version control) for your content.  You just get so much out of the box:

- No database required for your content
- Portability and no lock-in
- Git history, rollbacks, etc.
- CI/CD-friendly workflow
- Use of open-formats like Markdown, MDX, and JSON

However, using Git as content storage comes with limitations.  Typically, files like Markdown are only queried at build time and ideal for statically generated pages, and not used for dynamic pages with server-side rendering (SSR).  To allow for SSR with Git-backed content, Tina will be expanding on its GraphQL API to allow public access (with a read-only token), so you can query your Git-backed content like you would with any other API-first Headless CMS. This gives you the best of both worlds: the ability to use open, reliable formats and version control for your content, and the flexibility to query that data dynamically, if needed (i.e. getStaticProps in [Next.js](https://nextjs.org/) or useLoaderData in [Remix](https://remix.run/)).

Tina’s headless API will allow you to use advanced queries for your content (i.e. sort, filter, paginate, and relations) which we will cover in the next section.&#x20;

## Markdown at Scale

Using Markdown for sites with thousands of pages has become a much better experience with tools like [Incremental Static Regeneration](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration) (ISR) in Next.js. Now you can get the reliability of storing content in Markdown files without the need to compile every page upfront, resulting in shorter build-times.  This year, we will improve what it’s like to manage content across all of those thousands of Markdown, MDX, or JSON files. This includes:

- Migration and audit capabilities in the TinaCMS CLI to ensure data consistency across all of your files based on your Tina Schema file
- Improved querying with the [GraphQL API](https://tina.io/docs/graphql/overview/) - supporting advanced queries for your content (i.e. sort, filter, paginate) and relational data across multiple files (i.e. if your Markdown blog post has an associated author, query the author name, bio, etc)
- A workflow that supports local and cloud development

We are making the Markdown experience feel more like working with a database so Git can scale to extremely large sites.

## New UI

We’ve been making major improvements to Tina’s UI. Specifically:

### 1. Revamped UI

Tina’s UI will offer a more-traditional CMS experience for browsing content on your site.  That way, you can browse and edit content that isn’t associated with a view, like an author in the example below and you will get the rich preview of your site only when you wire up “contextual editing” on specific pages.

<Youtube embedSrc={"https://youtube.com/embed/GMe8F7vyUa0"} />

### 2. Built on Tailwind

Tina’s editing UI is moving to [Tailwind](https://tailwindcss.com/) to make it easier to customize and extend. ![tailwind css logo](https://res.cloudinary.com/forestry-demo/image/upload/v1645631818/blog-media/tailwindcss.jpg)

### 3. Blocks UI

Tina will have an improved block-picking experience so users can get a visual preview of their blocks before adding them to the page.

<Youtube embedSrc={"https://youtube.com/embed/iiJo8mBE9Oo"} />

### 4. Rich Text Editing and MDX

Tina’s rich text editing (with embeddable [MDX](https://mdxjs.com/) components) experience will see major improvements.  Content creators who write long-form content like blog posts or documentation are going to love the new rich text field

<Youtube embedSrc={"https://youtube.com/embed/rZG_HxT-2Bc"} />

## A more open and more extendible Tina

In a previous chapter of my life, I was a freelance and agency developer and I benefited greatly from using open-source WordPress. I was a part of the so-called “WordPress economy”. Now with TinaCMS, we want to allow others to leverage our open-source software.

Currently, most of Tina is open-source, but Tina Cloud is required when editing content in your production site.  Tina Cloud proxies requests through to the GitHub API and this allows us to ensure the editing experience is great. For example, you don’t need a GitHub account to edit content, you’re not being rate limited by the GitHub API, and we can prevent people from overwriting each others’ changes when multiple people are editing the same piece of content simultaneously.  However, in the future, we want to ensure Tina Cloud is opt-in and not lock-in.  We’re currently researching our options to provide a path that doesn’t require Tina Cloud later this year.

We don’t just want Tina to be open-source, but we want it to be the most hackable CMS on the planet to give developers complete control over customizing the editing experience for their teammates and clients.  Currently, it can be cumbersome to extend and customize Tina in some specific ways. Expect to see big improvements when it comes to extending Tina. If you’re interested in how some of this will be architected, see this [GitHub discussion](https://github.com/tinacms/tinacms/discussions/2402).

Finally, we are making the [TinaCMS Schema](https://tina.io/docs/schema/) more modular. That way, you can split up your schema and keep it close to your React components for more portability.

## Conclusion

I hope this gives you a picture of what we’re trying to accomplish this year.  We are already seeing people build great things with TinaCMS. This year will be full of upgrades, new features, and an all around amazing CMS experience for both developers and content creators.  We will show the world what becomes possible when you use Git + the JAMstack.

If you haven’t had a chance to try Tina yet, spin up a starter site on Tina Cloud or with the command line and share your feedback.

<CreateAppCta ctaText="Try a starter" cliText="npx create-tina-app@latest" />

Our [Discord community](https://discord.com/invite/zumN63Ybpf) is full of developers building next-generation sites and our amazing team is always there to lend a hand. And you can always reach out to [me on twitter](https://twitter.com/scottgallant).
