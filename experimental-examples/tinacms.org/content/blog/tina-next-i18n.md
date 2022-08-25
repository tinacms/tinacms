---
title: Using Tina to power Internationalization
date: '2022-06-16T14:00:00.000Z'
author: James Perkins
prev: content/blog/a-b-test-with-tina.md
---

When working on a website you may need to introduce internationalization also known as i18n. While Tina currently doesn’t offer a plugin or native support we can leverage Next.js’s i18n feature to create a site that has internationalization support. 

## Create a new project.

To create our project we can use the `create-tina-app` that will use one of our starters. For this blog post, we are going to use the barebones starter. 

```bash
npx create-tina-app@latest tina-internationalization

✔ Which package manager would you like to use? › Yarn
✔ What starter code would you like to use? › Bare bones starter
```

Now we have a basic project setup we are going to do the following things to make i18n work:

- Add a `next.config.js` file that contains all the locales we want to support.
- Update our `getStaticPaths` and `getStaticProps`
- Create files for the locale variants

## Adding our locales to the `next.config.js`

The `next.config.js` allows you to create advanced configurations for your Next.js sites, including what locales you want to support on your site. 

> If you want to read more about next.config.js and all the configurations you can set, check out the next.js [documentation](https://nextjs.org/docs/api-reference/next.config.js/introduction).  

To support different locales we need to add the `i18n` object to the configuration: 

```json
module.exports = {
    i18n: {}
}
```

Then inside the i18n object, we need to add two things, a `locales` array, and a `defaultLocale` . The `defaultLocale` will be used if someone visits a locale you don’t support. In our example, we are going to support `en-US` and `fr`  

```json
module.exports = {
    i18n: {
      locales: ['en-US', 'fr'],
      defaultLocale: 'en-US'
    }
  }
```

## Update `getStaticPaths`

Now we have configured our Next.js application to use locales we now to need to update our `getStaticPaths` to use them. Open up the blog post file found under `pages/posts/[slug].js` and at the bottom of the file you will see the following:

```jsx
export const getStaticPaths = async () => {
  const postsResponse = await staticRequest({
    query: `{
        postConnection {
          edges {
            node {
              _sys {
                filename
              }
            }
          }
        }
      }`,
    variables: {},
  });
  const paths = postsResponse.postConnection.edges.map((x) => {
    return { params: { slug: x.node._sys.filename } };
  });

  return {
    paths,
    fallback: "blocking",
  };
};
```

 We can pass locales as a prop to the `getStaticPaths` function and Next.js will send the array of all configured locales. We can also update paths to start as an empty array:

```jsx
export const getStaticPaths = async ({locales}) => {
const paths = [];
...
```

Now we have the ability to access each locale we need to update our `paths` variable to include the `locale`. We will need to map over each locale so we can create a path for each one.  

```jsx
postsResponse.postConnection.edges.map((post) => {
    // ensure a `path` is created for each `locale`
    locales.map((locale) => {
      paths.push({
        params: { slug: post.node._sys.filename },
        locale,
      });
    });
  });
```

The completed `getStaticPaths` should look like this:

```jsx
export const getStaticPaths = async ({locales}) => {
  const paths =[];
  const postsResponse = await staticRequest({
    query: `{
        postConnection {
          edges {
            node {
              _sys {
                filename
              }
            }
          }
        }
      }`,
    variables: {},
  });
  postsResponse.postConnection.edges.map((post) => {
    // ensure a `path` is created for each `locale`
    locales.map((locale) => {
      paths.push({
        params: { slug: post.node._sys.filename },
        locale,
      });
    });
  });

  return {
    paths,
    fallback: "blocking",
  };
};
```

## Updating `getStaticProps`

We need to make a small change to our `getStaticProps` function to look for the locale and add that to the relative path so we are editing the correct file. 

```jsx
++ relativePath: `${ctx.locale}/${ctx.params.slug}.md`,
-- relativePath: `${ctx.params.slug}.md`,
```

With this change, we can now open any of the support locale URLs. Our application is now ready to support our locales, but how do we create new files for each locale?

## Using Tina to create files for each locale

To create our files we are going to leverage a filename structure of `<locale>/posname` the locale will be handled by Next.js So a filename of `fr/bonjour` will be treated as `<domain>/fr/another-post` in your Next.js application.

Below is an example of the file structure. 

![Example of the file structure used when creating a new file in Tina](https://res.cloudinary.com/forestry-demo/image/upload/v1655216726/blog-media/tina-i8n/Screen_Shot_2022-06-09_at_10.34.47_AM.png)


## How to keep up to date with Tina?

The best way to keep up with Tina is to subscribe to our newsletter. We send out updates every two weeks. Updates include new features, what we have been working on, blog posts you may have missed, and more!

You can subscribe by following this link and entering your email: [https://tina.io/community/](https://tina.io/community/)

### Tina Community Discord

Tina has a community [Discord](https://discord.com/invite/zumN63Ybpf) full of Jamstack lovers and Tina enthusiasts. When you join, you will find a place:

- To get help with issues
- Find the latest Tina news and sneak previews
- Share your project with the Tina community, and talk about your experience
- Chat about the Jamstack

### Tina Twitter

Our Twitter account ([@tina_cms](https://twitter.com/tina_cms)) announces the latest features, improvements, and sneak peeks to Tina. We would also be psyched if you tagged us in projects you have built.


