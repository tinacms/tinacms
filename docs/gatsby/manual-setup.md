# Manual Setup

This is a guide on how to setup the XEditor CMS on an existing Gatsby site.

## Installation

```
npm install --save @forestryio/gatsby-plugin-xeditor
```

or

```
yarn add @forestryio/gatsby-plugin-xeditor
```

## Adding the Plugin

Open your `gatsby-config.js` file and add `'@forestryio/gatsby-plugin-xeditor'` to the list of plugins:

```javascript
module.exports = {
  // ...
  plugins: [
    '@forestryio/gatsby-plugin-xeditor',
    // ...
  ],
}
```

## Accessing the CMS

1. **Start the Gatsby development server**

   ```
   gatsby develop
   ```

1. **Visit your Website**

   Go to https://localhost:8000 to access your website.

1. **Open the CMS**

   There should now be an **Open CMS** button floating in the top right of the screen. Click that button and the CMS sidebar will appear on the left side of the screen.

## Next Steps

- [Configure the Sidebar](./configure-sidebar.md)
- [Editing Markdown Files](./editing-markdown-2.md)
- [Editing JSON Files](./editing-json.md)
- [Creating Custom Fields](./custom-field-plugins.md)
