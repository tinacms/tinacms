# gatsby-plugin-tinacms

A Gatsby plugin for adding Tina to your website.

## Installation

```bash
yarn add gatsby-plugin-tinacms
```

## Setup

Include `gatsby-plugin-tinacms` in the list of gatsby plugins:

**gatsby.config.js**

```javascript
module.exports = {
  // ...
  plugins: [
    // ...
    {
      resolve: 'gatsby-plugin-tinacms',
      options: {
        enabled: process.env.NODE_ENV !== 'production',
        sidebar: {
          position: 'displace',
        },
        plugins: [
          //...
        ],
      },
    },
  ],
}
```

## Options

```ts
export interface GatsbyPluginTinacmsOptions {
  enabled?: boolean
  sidebar: TinaCMSConfig['sidebar']
  toolbar: TinaCMSConfig['toolbar']
  manualInit?: boolean
}
```

Visit the [Using Gatsby with a Git Backend](/guides/gatsby/git/installation) guide for step-by-step instructions on using this package in concert with other Tina+Gatsby plugins. 
