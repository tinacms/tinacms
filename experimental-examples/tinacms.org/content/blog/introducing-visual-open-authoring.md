---
title: Introducing Visual Open Authoring
date: '2020-03-09T07:00:00.000Z'
author: Scott Gallant
draft: false
consumes: null
next: content/blog/tinacms-ui-whats-next.md
prev: content/blog/gatsby-tina-101.md
---

We're focused on improving the independent web as a whole. We want to craft tools that help people build better sites and create better content.

In line with this mission, we sought to create something we call **Visual Open Authoring** ✍️. The [open authoring concept](https://css-tricks.com/netlify-cms-open-authoring/#article-header-id-0) was originally pioneered by [Netlify CMS](https://www.netlifycms.org/) this past summer and involves opening up your website's CMS to accept content-related contributions from anyone. Using Tina, we were able to take this a step further, establishing the editing context **on the page itself**.

## Add an "Edit Mode" to Your Site

**Picture this:** on your website, there's an _"Edit this page on GitHub"_ link — familiar enough. But imagine that when you click it, instead of kicking you over to GitHub, the site itself becomes editable, **like a Google Doc**.

The experience should feel familiar for anyone that has used a word processor or site builder. You navigate to the page you want to change, click “Edit”, make updates in a WYSIWYG, and then submit your changes. That’s it 🧞‍♂️.

![TinaCMS Visual Open Authoring](/gif/open-auth.gif)

## What's under the hood?

The scaffolding underneath **Visual Open Authoring** is a Git-based workflow. Triggering "Edit Mode" creates a new fork to track and commit changes on. When content updates are ready, the editor can make a **pull request**. The site owner can then review the work before making it live.

Currently, this requires a GitHub account and some knowledge of Git workflows, making Open Authoring ideal for developer-centric sites (docs, wikis, etc). Soon, we will be opening up [Tina Teams](https://tinacms.org/teams) so people without GitHub accounts can easily edit in real-time too.

We're currently prototyping this on our own site. In the coming weeks, the APIs for integrating **Visual Open Authoring** with Tina will become available. In the meantime, click the **edit button** at the top of this blog to try it out. Feel free to reference this site’s [source code](https://github.com/tinacms/tinacms.org) to see how it works.

![edit](https://res.cloudinary.com/forestry-demo/image/upload/w_800,bo_2px_solid_grey/v1583778760/TinaCMS/click-edit-button.png)

## Using Next.js to Enable "Edit-mode"

A new feature [announced in Next.js 9.3](https://nextjs.org/blog/next-9-3) has been instrumental to providing the ideal experience for **Visual Open Authoring**. The _preview mode_ capability allows us to host a website that is fully static by default, but switches to a dynamic mode that runs server code for users that have a special "preview" cookie set. What we refer to as "Edit Mode" for **Visual Open Authoring** is the same as this Next.js "Preview Mode".

The ability for a website to run statically by default, and then "wake up" into a dynamic web application in response to specific user actions, is revolutionary. It significantly simplifies the concerns of operating an editing environment with Tina. With this workflow, we don't have to host a separate [Cloud Editing Environment](https://tinacms.org/blog/editing-on-the-cloud) — **the live site is the editing environment!** And thanks to Git and our fork-based workflow, we can edit content from the production website worry-free.

## Crowdsourcing your content

**Visual Open Authoring** is a unique, low-friction approach to website editing. Thanks to the clever Next.js preview mode, Tina's content flexibility, and the seamless [Inline Editing](https://tinacms.org/docs/ui/inline-editing) experience, we're ready for a digital content revolution.

What if it were effortless to fix a spelling error on the New York Times? Imagine contributing to the ReactJS documentation in an instant.

**The web is all about community**, crowdsourcing, and the power of many perspectives. The easier it is to make content contributions, the more viewpoints we incorporate. The less context switching, the _more space for creative expression_ of ideas.

Let's democratize content and strengthen the independent web.
