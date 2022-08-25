---
title: Export WordPress Content to Markdown and Gatsby
date: '2020-01-13T00:00:00.000Z'
draft: false
author: Mitch MacKenzie
#next: content/blog/custom-field-components.md
#prev: content/blog/three-ways-to-edit-md.md
warningMessage: '**Update:** The examples in this post reference an outdated Gatsby implementation. We recommend using [Next.js](/docs/setup-overview/) for a solution with less friction.'
---

Say hello to the [WordPress to Gatsby Markdown Exporter](https://github.com/tinacms/wp-gatsby-markdown-exporter)! It's a WordPress plugin to export posts, pages, and other content from WordPress to Markdown.

A modern static site generator like [GatsbyJS](https://www.gatsbyjs.org/) can be a great alternative to power a website that was previously built with WordPress. Add TinaCMS into the mix for real-time editing and we get a modern website that developers and content creators will enjoy.

Gatsby provides the common benefits of traditional static site generators like increased security, improved performance, and lower maintenance overhead. It also tackles modern problems like enhanced offline browsing and progressive image loading.

Gatsby can include content from many sources, including existing WordPress sites. If we want to decommission a WordPress site, exporting the content to Markdown will ensure it's editable in the future (Markdown is a way of formatting content that's widely used by static website generators).

That's where the WP Gatsby Markdown Exporter plugin helps us.

## Installing the exporter plugin

Installing the exporter WordPress plugin is like most other plugins.

The plugin is [released on WordPress.org](https://wordpress.org/plugins/wp-gatsby-markdown-exporter/) so it can be installed through the WordPress admin by searching for "WP Gatsby Markdown Exporter" on the "Add Plugins" page.

Or to install manually:

1. [Download the latest release](https://github.com/tinacms/wp-gatsby-markdown-exporter/releases/latest/download/wp-gatsby-markdown-exporter.zip).
2. Unzip the files into the WordPress plugins directory (usually wp-content/plugins).
3. Activate the plugin from the WordPress admin.

## Using the plugin

![WP Gatsby Markdown Exporter plugin screenshot](/img/blog/wp-gatsby-markdown-exporter-screenshot.png)

Clicking "Export to Gatsby" in the WordPress admin sidebar will bring us to a form to download a Zip file of the site's content.

The form has several options that allow us to customize the exported content so that it fits into a Gatsby website.

Exporting content to a new system is usually an iterative process so we may need to tweak the export options and try a few times before getting it right.

The plugin also provides a command to be run on the CLI using [WP-CLI](https://wp-cli.org/). This option works best for WordPress sites with a lot of content and gets around PHP limitations like timeouts. Check out more details about CLI usage in the [plugin's readme file](https://github.com/tinacms/wp-gatsby-markdown-exporter/blob/master/README.md).

## Getting exported content into Gatsby blog starter

[Gatsby's blog starter](https://github.com/gatsbyjs/gatsby-starter-blog) is an easy way to see how Markdown can be used with Gatsby. The starter's [quick start guide](https://github.com/gatsbyjs/gatsby-starter-blog#-quick-start) has details to get it up and running.

To get our exported WordPress content in place:

1.  Unzip the exported Markdown files into the "content/blog" directory of the starter.
2.  Place the "uploads" directory from the WordPress export in the "content" directory of the starter.
3.  Add the following under the plugins section of gatsby-config.js so that any images and uploads exported from WordPress can be found by Gatsby:

```
{
  resolve: `gatsby-source-filesystem`,
  options: {
    path: `${__dirname}/content/uploads`,
    name: `uploads`,
  },
},
```

Then running `gatsby develop` or `gatsby build` will show the newly exported content in Gatsby.

If we're building a more complex site though, Tina Grande may be the next starter to try.

## Getting exported content into Tina Grande

[Tina Grande](https://github.com/tinacms/tina-starter-grande) is a beautiful Gatsby starter that includes TinaCMS for real-time content editing.

With a few easy export customizations we can get our WordPress content into Tina Grande and fully editable.

Tina Grande uses an `authors` frontmatter field that expects a list of authors, so we'll need to tell the exporter plugin to restructure our WordPress content to accommodate that. Tina Grande also uses the `path` field so we'll switch the label of the field that's exported from WordPress.

On the exporter form's "Change field name" we'll add:

    author,authors
    permalink,path

and on the form's "Convert fields to array" we'll add (the original name of the authors remapped field):

    author

![WP Gatsby Markdown Exporter config for Tina Grande](/img/blog/tina-grande-wp-export.png)

## Next steps exporting to Gatsby

A content export and conversion will rarely be perfect the first time it's run! Fields may not be mapped correctly so it's a good idea to check over the exported content, make tweaks to the exporter plugin config, and try again. Manual content adjustments may be needed here and there to account for different styling patterns between the old WordPress site and the new Gatsby website.

Reach out on [WordPress.org](https://wordpress.org/support/plugin/wp-gatsby-markdown-exporter/) or [GitHub](https://github.com/tinacms/wp-gatsby-markdown-exporter/issues) if you have any questions, feature enhancements, or bug reports for the exporter plugin.

And don't forget to consult the [docs](/guides/gatsby/adding-tina/project-setup) to learn more about how TinaCMS can work with Gatsby.
