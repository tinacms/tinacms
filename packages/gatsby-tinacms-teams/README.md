# gatsby-tinacms-teams

Adds [Tina Teams](https://tinacms.org/teams/) authentication and authorization to a Gatsby site.

## Install

```
npm install --save gatsby-tinacms-teams
```

or

```
yarn install gatsby-tinacms-teams
```

## How to Use

### Setting up Tina Teams

**TODO**

### Configuring the Plugin

```js
// In your gatsby-config.js
plugins: [
  {
    resolve: "gatsby-plugin-tinacms",
    options: {
      plugins: [
        "gatsby-tinacms-teams"
      ]
    }
  }
],
```

### Starting the App

Teams authentication is controlled by the `REQUIRE_AUTH` environment variable.

**package.json**

```
"scripts": {
  "auth-start": "REQUIRE_AUTH=true gatsby develop"
}
```

Alternatively, you can use .env files:

**.env.staging**

```
REQUIRE_AUTH=true
```

[![TINA CMS](https://res.cloudinary.com/forestry-demo/image/upload/h_46/v1573166832/Tina_CMS_Wordmark.png)](https://tinacms.org)
