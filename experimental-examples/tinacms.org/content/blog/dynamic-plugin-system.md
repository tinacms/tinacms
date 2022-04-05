---
title: Dynamic Plugins in TinaCMS
date: '2019-12-09T07:00:00.000Z'
author: Nolan Phillips
draft: false
consumes:
  - file: /packages/@tinacms/src/plugins.ts
    details: Talks at a high level about the plugin manager
  - file: /packages/gatsby-tinacms-remark/src/remark-creator-plugin.ts
    details: Shows example of RemarkCreatorPlugin in use
next: content/blog/add-and-delete-files.md
prev: content/blog/deprecating-tina-git-server.md
---

One of the most important aspects of TinaCMS is its dynamic plugin system.

Usually plugin systems are static. We list all the plugins we need in a config and use them as long as the application is running. This is not the case with TinaCMS. Instead, we add and remove plugins from the CMS over the life of the application.

Take the postCreatorPlugin defined below; it adds a button to the sidebar so you can create new blog posts:

```js
import slugify from 'slugify'

const postCreatorPlugin = new RemarkCreatorPlugin({
  label: 'Post',
  fields: [{ name: 'title', label: 'Post', component: 'text' }],
  filename({ title }) {
    return `content/posts/${slugify(title).toLowerCase()}.md}`
  },
  frontmatter({ title }) {
    return { title }
  },
})
```

With most systems, we would add plugins at startup and would stay for the duration of the session. No matter where you were on the site, you would be able to create a “Post”. (Note: you could get around this by having the plugin hides itself, but the added responsibility complicates the API.)

With TinaCMS we can add and remove plugins programmatically. This quality gives developers a lot of power–they can decide how to add and remove features from the CMS based on the context.

The usePlugins hook, an API available to React sites, registers the postCreatorPlugin only when the BlogIndex is rendered:

```js
import { usePlugins } from "tinacms"
import { postCreatorPlugin } from "./post-creator-plugin"

function BlogIndex(props) {

  usePlugins(postCreatorPlugin)

  return ( ... )
}
```

Do you have a multilingual site? If someone is browsing the french version make the CMS add new pages to the french site, not the english one.

Do you have posts and events? Expose the ability to create posts only from /blog, and events only from /events.

This plugin system demonstrates how the principle of Inversion of Control influences TinaCMS. Deciding when to enable certain features of the CMS is a complex responsibility. Static plugin systems give it to either the system itself or to the plugin developer. TinaCMS gives that responsibility to the plugin user.

This approach benefits both sides: plugin authors don’t have to worry about implementing some complex configuration scheme, and developers can apply the plugin in both simple and complex use cases without resorting to hacks.

If you're interested in learning more about plugins in TinaCMS, checkout the [documentation](https://tinacms.org/docs/cms#plugins). Interested in creating your own plugin? Head over to the contribution [guidelines](https://tinacms.org/docs/contributing/guidelines). Feel free to post any questions or comments in the [Tina Forum](https://community.tinacms.org/t/dynamic-plugins-in-tinacms/37).
