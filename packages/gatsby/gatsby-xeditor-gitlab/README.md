# @tinacms/gatsby-tinacms-cms

A Gatsby plugin for using the Gitlab API with an Tina CMS

## Installation

```
npm install --save @tinacms/gatsby-tinacms-gitlab
```

or

```sh
yarn add @tinacms/gatsby-tinacms-gitlab
```

## Setup

Include `@tinacms/gatsby-tinacms-gitlab` in the list of gatsby plugins:

_gatsby.config.js_

```javascript
module.exports = {
  // ...
  plugins: [
    // ...
    {
      resolve: '@tinacms/gatsby-tinacms-gitlab',
      options: {
        appID: 'APP_ID',
        redirectURI: 'http://localhost:8000/?auth-gitlab',
        repositoryID: 'USER/REPO',
      },
    },
  ],
}
```
