---
title: Tina Cloud is in public Alpha
date: '2021-06-01T20:00:00-04:00'
author: James Perkins
last_edited: '2021-06-17T12:45:15.979Z'
---

The team at Tina is pleased to announce that [Tina Cloud](/) is officially in public Alpha. Everyone is encouraged to [register a free account](https://app.tina.io/register) on our headless GitHub-backed CMS and start committing. We have been working incredibly hard behind the scenes to get our vision in the hands of developers and content teams.

Tina Cloud brings the power of Tina's open-source content editor with [a GraphQL API that allows you to interact with your Markdown files stored in your repository](/blog/using-graphql-with-the-filesystem/). Also, with Tina Cloud, you can allow _any_ team member to edit content — even if they don’t have a GitHub account.

When we [launched TinaCMS](https://www.youtube.com/watch?v=iPDCmbaEF0Y), it was mainly an open-source Javascript UI for editing your site, visually.

![Real-time editing of a Next.js + Tailwind CSS site with Tina’s sidebar.](https://res.cloudinary.com/forestry-demo/image/upload/v1619023278/tina-cms-visual-editing.gif 'Real-time editing of a Next.js + Tailwind CSS site with Tina’s sidebar.')

At that time, TinaCMS was a 3-month-old, open-source project and we relied on developers to roll their own solution for user management, authentication, roles, content storage, and more. But we quickly learned that developers need more out-of-the-box to get their teams successful. With Tina Cloud, we're staying true to our vision of **Git-backed content management**, but with a batteries-included experience.

## What to Expect with the Tina Cloud Alpha?

Tina cloud is still being actively developed, and is in a place we believe you can have a great experience with it. You may run into issues we didn't encounter yet or be required to update to the latest version because we have improved our API.

Tina cloud isn't complete yet, some key features are currently being shaped up:

- Media Management Solution
- Multi-branch workflows
- Read-only tokens for our GraphQL API. That means it's only used when you are editing content.

## What tech stack should be used with Tina Cloud

- **Next.js**: [Next.js is a perfect match for Tina](/blog/tina-cloud-and-nextjs-the-perfect-match/) and is the default choice for our team.
- **GitHub**: GitHub is required as it is the only Git provider we support on Tina Cloud currently. Let us know if you want us to support other Git providers.
- **Static, file-based builds**: When you go to build our Tina Cloud product collects your filesystem content, in the future, you will be able to fetch data from our Cloud API during build times.

## How can I get started?

The first thing to do is to [signup for Tina Cloud](https://app.tina.io/register), once you're in, we have a few ways for you to get started and get up and running in minutes.

- [Tina Cloud Starter](https://github.com/tinacms/tina-cloud-starter): A basic implementation of Tina Cloud aimed at getting your up and running in a few minutes.
- [Tina Cloud Next.js blog starter](/guides/tina-cloud/existing-site/overview/) - A guide to add Tina Cloud on top of the default Next.js blog starter and work directly through our CMS.

You can also check out the video I created on getting started with Tina Cloud in under 10 minutes, if you gives you an overview of our Tina Cloud starter and gives you some tips to get started.

<Youtube embedSrc={"https://www.youtube.com/embed/Y-fG7qzoHKw"} />

## Where can I give feedback or get help?

We have a few channels open for you to reach out, provide feedback or get help with any challenges you may have.

- Dig into the new [Tina Cloud documentation](/docs/tina-cloud/) that covers implementations.
- [Join our Discord](https://discord.gg/zumN63Ybpf).
- [Email us](mailto:support@tina.io) if would like to schedule a call with our team and share more about your context.
- Get support through your Tina Cloud dashboard (there's a chat widget at the bottom of the screen on the left side).

## What about pricing?

We are still deciding out what we believe will be fair pricing for people who decided to use Tina Cloud. During the Alpha, **Tina Cloud is at no cost for small teams** and we will contact you if we believe your use case may eventually fit within our post-beta paid plans.

## Please reach out

The whole team is truly excited to enter a public Alpha phase and hope you will check it out and give us honest feedback. We wanna hear about your projects, let us know how Tina Cloud can help your team make progress.

To keep up to date with Tina goings-on make sure to follow [@tina_cms](https://twitter.com/tina_cms) and [@james_r_perkins](https://twitter.com/james_r_perkins) on Twitter.

Stay tuned for further improvements, features, community-built projects and more!
