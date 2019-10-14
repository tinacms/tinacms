# gatsby-tinacms-remark

A Gatsby/Tina plugin for editing Markdown files stored in git.

**What is Tina?**

Tina is a lightweight but powerful toolkit for creating a site editing ui with javascript components. Tina surfaces superpowers for dev’s to create, expand on and customize a simple yet intuitive ui for editing content.

Tina is optimized for nextgen JAMstack tools. It is based in javascript and is extensible enough to be configured with many different frameworks. Right now we have explored using Tina with Gatsby, Create-React-App & Next.js, with plans to dive into Vue.

[Visit the website to learn more!](https://tinacms.org/docs/)

## Installation

```
npm install --save gatsby-plugin-tinacms gatsby-tinacms-git gatsby-tinacms-remark
```

or

```sh
yarn add gatsby-plugin-tinacms gatsby-tinacms-git gatsby-tinacms-remark
```

## Setup

Include `gatsby-plugin-tinacms`, `gatsby-tinacms-git`, and `gatsby-tinacms-remark` in your config:

_gatsby-config.js_

```javascript
module.exports = {
  // ...
  plugins: [
    // ...
    {
      resolve: 'gatsby-plugin-tinacms',
      options: {
        plugins: ['gatsby-tinacms-git', 'gatsby-tinacms-remark'],
      },
    },
  ],
}
```

## Next Steps

Visit the [Markdown in Gatsby](https://tinacms.org/docs/gatsby/markdown) guide for more information
on creating and editing markdown files.
