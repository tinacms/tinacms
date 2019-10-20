# gatsby-plugin-tinacms

A Gatsby plugin for adding Tina to your website.

**What is Tina?**

Tina is a lightweight but powerful toolkit for creating a site editing ui with javascript components. Tina surfaces superpowers for dev’s to create, expand on and customize a simple yet intuitive ui for editing content.

Tina is optimized for nextgen JAMstack tools. It is based in javascript and is extensible enough to be configured with many different frameworks. Right now we have explored using Tina with Gatsby, Create-React-App & Next.js, with plans to dive into Vue.

[Visit the website to learn more!](https://tinacms.org/docs/)

## Installation

```
npm install --save gatsby-plugin-tinacms
```

or

```sh
yarn add gatsby-plugin-tinacms
```

## Setup

Include `gatsby-plugin-tinacms` in the list of gatsby plugins:

_gatsby.config.js_

```javascript
module.exports = {
  // ...
  plugins: [
    // ...
    {
      resolve: 'gatsby-plugin-tinacms',
      options: {
        plugins: [
          //
        ],
        sidebar: {
          hidden: process.env.NODE_ENV === 'production',
          position: 'displace',
        },
      },
    },
  ],
}
```

## Next Steps

Visit the [Manual Setup](https://tinacms.org/docs/gatsby/manual-setup) guide for the complete
documentation on using Tina with Gatsby.
