# @tinacms/gatsby-xeditor-cms

A Gatsby plugin for using the Gitlab API with an Xeditor CMS

## Installation

```
npm install --save @tinacms/gatsby-xeditor-gitlab
```

or

```sh
yarn add @tinacms/gatsby-xeditor-gitlab
```

## Setup

Include `@tinacms/gatsby-xeditor-gitlab` in the list of gatsby plugins:

_gatsby.config.js_

```javascript
module.exports = {
  // ...
  plugins: [
    // ...
    {
      resolve: '@tinacms/gatsby-xeditor-gitlab',
      options: {
        appID: 'APP_ID',
        redirectURI: 'http://localhost:8000/?auth-gitlab',
        repositoryID: 'USER/REPO',
      },
    },
  ],
}
```
