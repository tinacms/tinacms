---
title: "Introducing Tina Grande \U0001F389"
date: '2019-11-21T14:58:24.451Z'
draft: false
author: Scott Byrne
next: content/blog/using-tinacms-with-nextjs.md
prev: content/blog/simple-markdown-blog-nextjs.md
warningMessage: '**Update:** The examples in this post reference an outdated Gatsby implementation. We recommend using [Next.js](/docs/setup-overview/) for a solution with less friction.'
---

[Tina Grande](https://github.com/tinacms/tina-starter-grande 'Tina Grande Repo') is a Gatsby starter with built-in TinaCMS integration. _Grande_ was built to provide a reference implementation of Tina that covers a variety of use cases. Even for those that don’t need a starter, we hope that Grande will prove to be a useful reference for both designers and developers looking to use TinaCMS.

[Check out the preview of Grande on Netlify.](https://tina-starter-grande.netlify.com/ 'Tina Grande Preview - Netlify')

![tina-starter-grande](https://res.cloudinary.com/forestry-demo/image/upload/v1574451940/Tina%20Grande/Blog_image.png)

## Breakdown

### 🧱 Content Structure

All site content is stored in the `/content` folder in the root of the project. Here you’ll find images, pages, posts, and settings. **Posts** use markdown, while **Pages** and **Settings** use JSON. You’ll notice there are `dummy.json` and `dummy.md` files; these are added to ensure that even if all site content is removed, the graphql queries will still work.

Gatsby pages are typically stored in `/pages`, which you won't find in _Grande_. Since all pages are dynamic, look to the `/content/pages` folder to see what pages will get generated.

### 🎨 Theme

_Grande_ features a fully customizable theme. You can edit the site colors, header styles, hero styles and more. Through the sidebar, select the **Theme** form to edit global theme settings. Note that **Hero** settings can be overridden by individual pages.

When you customize _Grande's_ colors, the theme will intelligently select a foreground color based on the theme colours chosen, which means you can choose any color without causing contrast issues. Some elements — such as links — select between the primary and secondary color based on which option provides better contrast. Updated colors will be reflected in the website as they're made, but the Tina UI _(and site meta colors)_ won't be updated until the Gatsby server is restarted.

Currently to customize the site logo you'll need to modify two files: `src/components/header.js` and `content/images/icon.png`. The header logo is a [styled-icon](https://styled-icons.js.org/) which allows for easy theming.

### 📄 Pages

Pages use a blocks-based system that is extendible to add any block you’d like. At the time of writing you can choose from a **title**, **form** or _**content**_ block.

The **form** block is a simple form builder with [**Formspree.io**](https://formspree.io/ 'Formspree.io') integration. You can select pre-made inputs or create a custom input. Each input has a **label**, **type** and **autocomplete** property. The first time your form is used from a new domain it requires confirmation, so send a test message and you'll receive a confirmation prompt from Formspree.

On the _page_ sidebar form you can select _hero_ to add a hero section to your page. If the hero contains a **headline**, **textline** or at least one **action** it will be rendered above your content. The default hero image is set through the theme but can be customized on a per-page (or post) basis. Toggle **large** to add extra vertical spacing to the hero section.

### 📝 Posts

You can create posts from within Tina by using the _+_ button in the top right of the sidebar. Posts are created as a draft by default and won’t be published with your live site. You can edit the post in the sidebar, or use the in-page editor to write your blog post by clicking the _edit_ button on the top left of the post.

# ✨

Thanks for reading! Jump over [to the repo](https://github.com/tinacms/tina-starter-grande) to see what we're working on adding next or to report a bug. Grande is under active development and welcomes contributions of any kind
