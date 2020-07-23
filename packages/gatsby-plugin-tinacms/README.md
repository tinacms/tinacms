# _gatsby-plugin-tinacms_

A Gatsby plugin for adding Tina to your website. This plugin wraps your site in a `TinaProvider` and instantiates the CMS.

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
  [sidebar: TinaCMSConfig['sidebar']](https://tinacms.org/docs/ui#enabling-the-user-interface)
  toolbar: TinaCMSConfig['toolbar']
  manualInit?: boolean
}
```

Visit the [Using Gatsby with a Git Backend](/guides/gatsby/git/installation) guide for step-by-step instructions on using this package in concert with other Tina+Gatsby plugins. 
