# Configuring the Sidebar

The Xeditor sidebar has two properties that can be configured:

- `logo: string`
- `title: string`

These values can be set in the **gatsby-config.js** file.

```javascript
module.exports = {
  // ...
  plugins: [
    {
      resolve: '@tinacms/gatsby-plugin-tinacms',
      options: {
        title: 'My CMS',
        logo:
          'https://seeklogo.com/images/G/gatsby-logo-1A245AD37F-seeklogo.com.png',
      },
    },
    // ...
  ],
}
```
