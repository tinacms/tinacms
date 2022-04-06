---
title: Adding Tina to an existing NextJS site
id: /docs/introduction/tina-init/
last_edited: '2022-02-04T15:51:56.737Z'
next: '/docs/using-tina-editor'
---

> Note: This doc assumes that you have a working NextJS site. If not, you can quickly get started using one of our [starters](/docs/introduction/using-starter/).

## Adding Tina

We created a quick way to bootstrap a Tina application to show the power of visual editing; from your terminal, enter the following command:

```bash,copy
npx @tinacms/cli@latest init
```

This command does a few things in your Next.js application:

1. Installs all required dependencies for Tina.
2. Defines a basic content schema in the `.tina` directory.
3. Adds some Tina boilerplate components.
4. Creates example content in the demo directory.
5. Edit the `package.json` to have the `dev`, `build`, and `start` scripts run the tina GraphQL API.

Now that Tina has been installed in your site, you will need to add the Tina Provider to your site's layout.

In your `_app.jsx` file, you will want to wrap your layout with the TinaProvider
from `.tina/components/TinaDynamicProvider.js`

```diff
+ import TinaProvider from ../.tina/components/TinaDynamicProvider.js

// ...

return (
+  <TinaProvider>
     <Component {...pageProps} />
+  </TinaProvider>
)

```

### A quick test

Now that we have a basic Tina setup, you can launch your application using the following commmand:

```bash,copy
yarn dev
```

When Tina is initialized on a NextJS site, a "/admin" page is created to allow editors to log in and begin to make content changes.

Now, if you navigate to http://localhost:3000/admin (assuming your site runs on port 3000), you should see a new CMS landing page has been added to your site!

![Tina Login Page](/img/tina-login.png)

Next we'll show you how to use the CMS and start editing some content!
