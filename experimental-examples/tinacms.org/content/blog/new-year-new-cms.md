---
title: 'New Year, New CMS?'
date: '2022-01-06T00:00:00-04:00'
author: James Perkins
last_edited: '2022-01-09T19:11:29.283Z'
opengraph:
  image:
    url: >-
      https://res.cloudinary.com/forestry-demo/image/upload/v1641391956/blog-media/new_year_new_cms.png
    width: '1920,'
    height: '1080,'
    alt: 'New Year, New CMS?'
---
Here we are, the new year is upon us, and if you are like us, you have set some New Year’s resolutions for yourself. We are big fans of the fresh start and self-improvement that comes along with this time of year. Have you set any resolutions, maybe building or rebuilding your own personal site, starting a new business, or giving your portfolio a new lick of pain?. That means that you will need a CMS to handle all the content that drives your site and we think Tina can fill the role in some unique ways.

## Why Tina?

### Git Backed

Traditionally when you sign up for a CMS, your content is locked into the vendor. This means if you decide that the CMS is not for you, you have to find a way to export that data and import it into your new CMS. That is not what Tina is about, we don’t want to hold you or your content hostage. In fact, Tina doesn’t store any of your data, it is stored in a GitHub repository that you own. Yep, that is right, you own and control it all. In addition to feeling secure that you own your own content, there are many practical advantages to this approach such as:

* Easy to track when and what changed in your project
* CI / CD support
* No vendor lock in

### Contextual Editing

Tina is different from a traditional headless CMS, where you enter your data into a form with no context of how it will behave or look on your site. You then have to kick off a build and navigate to your site to see the changes.
When you use Tina, the content is edited using a sidebar on your site, you get to see the changes in real time as you make them. This allows you to see exactly what you are editing or creating and how it will look and behave. No more saves, previews, refreshes after every few edits. Once you are happy with the changes, you can hit save and Tina will commit it directly to your GitHub repository and the rebuild process will begin.

### Native MDX Support

Tina can support MDX out of the box, this means you can create reusable components and Tina can provide an easy way for anyone editing or creating content to add them to the page, no matter how experienced they are.

Other headless CMSs require the users who are creating the content to remember the Component names, use the correct syntax when using them, as well as transform the data using mdx-remote or something similar. This is fine for an experienced developer but if you want to bring on guests who have zero experience it is a steep learning curve. Seriously, ask your editor friends about this, see the rage and/or fear in their eyes.

We include a button that will allow anyone to click, select the user-friendly named component, and add it to the page. They can then dynamically edit that component with the correct text, images, or styles that you defined.
Tina also doesn’t require you to transform the MDX or hydrate your components, making it easier to integrate then traditional CMS.

## Three ways to get started in under five minutes

### Tina Quickstart

Our [Tina Quickstart ](https://app.tina.io/quickstart) flow is a web based way to get started with Tina, it allows you to choose from one of our starters (Tina Barebones, Tina Documentation Starter, Tina Cloud Starter) and deploy directly to Vercel.

This approach allows you to see how Tina works in a production deployment almost immediately . This is great for getting to know what Tina can do, how Tina works,and show it to others such as your content team.

![Tina Quickstart example](https://res.cloudinary.com/forestry-demo/video/upload/v1641390729/blog-media/new-year-new-cms/tina-quickstart.gif)

### `npx create-tina-app`

`create-tina-app` allows you to work locally with one of our starters, this allows you to see how all the code behind the scenes is working before you decide that Tina is right for you.

To use the `create-tina-app` you will need `Node 14+` .This doesn't require you to already have an application and will create a new project and directory and allow you to start developing locally.

![Create Tina App Example](https://res.cloudinary.com/forestry-demo/video/upload/v1641390724/blog-media/new-year-new-cms/create-tina-app.gif)

### Tina CLI

Tina CLI (`npx @tincms/cli@latest init`) allows you to add Tina to an existing Next.js application. When using the CLI we will take care of the important pieces including:

* Adding all the Tina dependencies
* Setting up a .tina folder with a basic schema
* Creating a demo directory with an example Tina powered page
* Creating an admin route
* Ensuring Tina best practices are used

Using the Tina CLI allows you to add Tina and selectively integrate it into your existing Next.js application. This allows you to keep your established site and slowly bring the power of Tina to your editors and content team. Though once you use it, we are not sure how slowly you will want to move.

![Tina CLI Example](https://res.cloudinary.com/forestry-demo/video/upload/v1641390724/blog-media/new-year-new-cms/tina-cli.gif)

## Where can you keep up to date with Tina?

You know that you will want to be part of this creative, innovative, supportive community of developers (and even some editors and designers) who are experimenting and implementing Tina daily.

### Tina Community Discord

Tina has a community [Discord](https://discord.com/invite/zumN63Ybpf) that is full of Jamstack lovers and Tina enthusiasts. When you join you will find a place:

* To get help with issues
* Find the latest Tina news and sneak previews
* Share your project with Tina community, and talk about your experience
* Chat about the Jamstack

### Tina Twitter

Our Twitter account ([@tina_cms](https://twitter.com/tina_cms)) announces the latest features, improvements, and sneak peeks to Tina. We would also be psyched if you tagged us in projects you have built.