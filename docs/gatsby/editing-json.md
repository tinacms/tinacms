# Editing JSON in Gatsby

## Installation

```
npm install --save gatstby-source-filesystem gatsby-transformer-json
```

or

```
yarn add gatstby-source-filesystem gatsby-transformer-json
```

## Configuring Gatsby

**gastby-config.js**

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/data`,
        name: 'data',
      },
    },
    'gatsby-transformer-json',
  ],
}
```

This will create a node for each json file in the `src/data` directory. You can then query that data like so:

```graphql
query MyQuery {
  dataJson(firstName: { eq: "Nolan" }) {
    lastName
    firstName
  }
}
```
