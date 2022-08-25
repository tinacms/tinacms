---
title: How can my editors edit a TinaCMS site?
date: '2019-12-23T10:00:00.000Z'
draft: false
author: James O'Halloran
next: content/blog/using-tinacms-on-gatsby-cloud.md
prev: content/blog/what-are-blocks.md
warningMessage: '**Update:** The examples in this post reference an outdated Gatsby implementation. We recommend using [Next.js](/docs/setup-overview/) for a solution with less friction.'
---

TinaCMS allows you to build live-editing functionality directly into your site. Tina differs from other headless CMS's (e.g [Forestry.io](https://Forestry.io), [NetlifyCMS](https://NetlifyCMS.org), [Contentful](https://contentful.com)) which simply allow you to edit your site's content and are relatively detached from your site's code. Having Tina sit in between your content and your site's template gives editors an amazing real-time editing experience where they can navigate to any area of the site, start making changes, and immediately see these changes reflected within the site.

![tina-diagram](/img/how_tina_works_asset.png)

With most JAMstack sites, there are various transformations happening that transform your editor's source content (e.g markdown) into the generated HTML on your live site. These transformations happen either at build time or while running a development server. For Tina to give your editors a live, hot-reloading experience **that also transforms content**, it needs to be run in a _live development environment_.

> So, do my editors need to run a local dev server to edit a TinaCMS site?

Nope! You'll be able to setup a **cloud editing environment** for your Tina site, and optionally use [Tina Teams](https://tinacms.org/teams) for some extended collaboration features.

### Hosting Your Cloud Editing Environment ☁️

Part of what makes Tina great is that it gives the developer control. It's important for us to extend this control into the Cloud editing experience. For this reason, we've designed it so that you can **host your cloud editing environment wherever you like.**

Already have a [Gatsby Cloud](https://www.gatsbyjs.com/cloud/) plan?
Want to host a small site under [Heroku's](https://www.heroku.com) free tier?

The choice is up to you!

You can fire up a **cloud editing environment** using one of these services and have users start making commits.

> If you're using Git as your backend, you may choose to host your master branch on the cloud editing environment (and have all commits deployed to your live site), or you can host a separate staging branch.

### Tina Teams

Depending on your use case, hosting might be all that you'll need to have your editors editing on the cloud. Otherwise, you might consider using **Tina Teams** for some additional functionality detailed below...

##### Authorization 👤

Some services (like Gatsby Cloud) will allow you to password protect your environment. If you're hosting somewhere else, you likely don't want strangers accessing your site and making commits. One of the features that **Tina Teams** provides is an _authentication layer over your cloud editing environment_. Users will first need to log in before accessing your cloud environment.

##### User Management 👨 👩

With Tina Teams, users can have **custom roles assigned to each user**, which can be referenced within your site.
Have an external contributor who can only access a specific blog post? How about an editor who can create, but not delete pages? The implementation is up to you and your site's needs.

##### Commit Authoring 🗣️

Since users will need to authenticate with Tina Teams, we can **tie commits back to the logged-in user**, so you can always find out who put that llama image in your blog post (so you can thank them, of course).
![tinacms-add-new-file-gif](/img/rico-replacement.jpg)

### In Summary

Not all sites fit into the same box, so we're giving you the flexibility to manage your cloud development environment in any way that makes sense for you. Running a development environment on **Gatsby Cloud** without **Tina Teams** will work for some, and certain users may require deeper user management with **Tina Teams**. We'll soon be posting examples of how to host your cloud editing environment on additional services as well..

We've also got some other "down the road" features planned which will make it much easier to work alongside other team members on your cloud environment, such as locking files when being edited by another user. Stay tuned!

# ✨

Thanks for reading! If you think Tina Teams might be a fit, you can sign up for our [Tina Teams Alpha](http://tinacms.org/teams) to try it out early!
