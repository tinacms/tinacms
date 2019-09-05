# Manual Setup

This is a guide on how to setup the Tina CMS on an existing Gatsby site.

## Installation

```
npm install --save @tinacms/gatsby-plugin-tinacms
```

or

```
yarn add @tinacms/gatsby-plugin-tinacms
```

## Adding the Plugin

Open your `gatsby-config.js` file and add `'@tinacms/gatsby-plugin-tinacms'` to the list of plugins:

**gatsby-config.js**

```javascript
module.exports = {
  // ...
  plugins: [
    '@tinacms/gatsby-plugin-tinacms',
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

- [Editing Markdown Files](./editing-markdown.md)
- [Editing JSON Files](./editing-json.md)
- [Creating Custom Fields](./custom-field-plugins.md)
