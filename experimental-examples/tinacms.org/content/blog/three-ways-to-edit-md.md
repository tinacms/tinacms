---
title: 3 ways to edit Markdown with Tina + Gatsby
date: '2020-01-09T07:00:00.000Z'
author: Thomas Weibenfalk
draft: false
consumes:
  - file: /packages/gatsby-tinacms-remark/src/RemarkForm.tsx
    details: Demonstrates use of RemarkForm
  - file: /packages/gatsby-tinacms-remark/src/remarkFormHoc.tsx
    details: Shows how to use remarkForm HOC
  - file: /packages/gatsby-tinacms-remark/src/useRemarkForm.tsx
    details: Demonstrates useLocalRemarkForm usage
next: content/blog/exporting-wordpress-content-to-gatsby.md
prev: content/blog/using-tinacms-on-gatsby-cloud.md
warningMessage: '**Update:** The examples in this post reference an outdated Gatsby implementation. We recommend using [Next.js](/docs/setup-overview/) for a solution with less friction.'
---

**Supercharge your static site with real-time content editing!** 🚀

In this post, I will explore _the three different methods_ Tina offers to edit Markdown on your Gatsby site. You’ll learn how to set up Tina with both Page Queries and Static Queries.

_This post will not cover the basics of using Tina with Gatsby. Please reference the _[_documentation_](https://tinacms.org/guides/gatsby/adding-tina/project-setup)_ on how to initially set up Tina with Gatsby._

## What’s the deal with Page Queries and Static Queries?

Before we dive down into editing Markdown with Tina we have to understand how Gatsby handles querying data with GraphQL. You can source data from almost anywhere in Gatsby. In our case, we’re using _Markdown_. When you build your site, Gatsby creates a GraphQL schema for all the data. Then you use [GraphQL](https://graphql.org/learn/) in your React components to query your sourced data.

Gatsby allows you to query your data in two ways: [_Page Queries and Static Queries_](https://www.gatsbyjs.org/docs/static-vs-normal-queries/).
Since the release of the [React Hooks API](https://reactjs.org/docs/hooks-intro.html) and the [`useStaticQuery` hook](https://www.gatsbyjs.org/docs/use-static-query/) in Gatsby, it is very easy to query your data. There are cases when you can’t use a Static Query though. First, let’s explore the differences.

### The two main differences are:

- Page Queries can accept GraphQL variables. Static Queries can’t.
- Page Queries can only be added to page components. Static Queries can be used in all components.

So, why can’t we use GraphQL variables in a Static Query? The reason for that is a Static Query doesn’t have access to the page context like a Page Query does. The result is that a Static Query won’t be able to access variables that are defined in the page context. You can define the page context in your `gatsby-node.js` file in your `createPage` function. Here you can supply your page with different variables that will get injected to your page on build time.

I use Static Queries as much as possible because I love the hooks API and the ease of composition possibilities it brings. For example, you can create custom hooks and reuse them in multiple components.

Let’s say that you have a GraphQL query that grabs metadata that you want on multiple pages. Create a custom React hook with the `useStaticQuery` Gatsby hook inside of it. Then you can use your custom hook wherever you want and always easily get that data into your component. When you need to have variables in your component, you have to use a Page Query. Page Queries cannot be used with the hooks API and have to be unique and attached to the specific page component.

Another great thing with Static Queries is that you can grab the data in the component that needs the data. That prevents [_prop drilling_](https://kentcdodds.com/blog/prop-drilling) and your data is more tightly coupled to the component where it is used.

## React overview

For getting data, we can use Gatsby's query options. For structuring our components, React also offers a couple of options. You can either create your component as a [class or a functional component](https://reactjs.org/docs/components-and-props.html). Before the React Hooks API, you had to use class components to have state in your components. Now with hooks, you can do this with functional components.🥰

## Three ways to edit Markdown with Tina

Given all the options for creating components and sourcing data in Gatsby, we have to choose the most suitable approach for the project. Tina can work with all of these options, providing [**three different approaches**](https://tinacms.org/guides/gatsby/git/create-remark-form) for editing Markdown with Gatsby as described below.

- **remarkForm** - A [Higher Order Component](https://reactjs.org/docs/higher-order-components.html) used when you source data from a Page Query in Gatsby. This component can be utilized with both functional and class components. Please note the subtle difference here! The only difference in naming from the render props component is the lowercase “r”.
- **useLocalRemarkForm** - A [React Hook](https://reactjs.org/docs/hooks-overview.html) that is intended for functional components sourcing data from either a Static or a Page Query. If the component is sourcing static data, Gatsby's `useStaticQuery` hook would be called.
- **RemarkForm** - A [Render Props Component](https://reactjs.org/docs/render-props.html) that you can use in class components sourcing data from either a Static or a Page Query. Static data would be sourced via Gatsby’s `StaticQuery` render props component.

### remarkForm - How to use it and why it won’t work with Static Queries.

First, Let’s dive into how to hook up TinaCMS with a Page Query.
The `remarkForm` Component in TinaCMS is a [Higher Order Component](https://reactjs.org/docs/higher-order-components.html), a HOC in short. This means that it is a function that takes in another component and will return a new component that has added functionality to it.

> If you’re not familiar with HOC's, I suggest you read about them in the [React official docs]("https://reactjs.org/docs/higher-order-components.html"). They are considered “advanced usage” in the React world.

The `remarkForm` component wants another component as an argument and is intended for Page Queries. A Page Query injects the data as a prop to the component and we access the data from this prop. With a `useStaticQuery` hook, the data is collected in a variable, that you choose, inside the component itself. That means if you're using the `useStaticQuery` hook in Gatsby you won’t have a component to give the `remarkForm` HOC. Bummer!😞 That’s why you can only use the `remarkForm` component with Page Queries.

So **how do you use this component with a Page Query** in Gatsby? First, check out the fictive Star Wars component below. It will show the three steps needed to hook everything up:

```javascript
// 1. Import the `remarkForm` HOC
import { remarkForm } from 'gatsby-tinacms-remark'

const StarWarsMovie = ({ data: { markdownRemark } }) => {
  return <h1>{markdownRemark.frontmatter.title}</h1>
}

// 2. Wrap your component with `remarkForm`
export default remarkForm(StarWarsMovie)

// 3. Add the required ...TinaRemark fragment to your Page Query
export const pageQuery = graphql`
  query StarWarsMovieById($id: String!) {
    markdownRemark(fields: { id: { eq: $id } }) {
      id
      html
      frontmatter {
        title
        releaseDate
        crawl
      }
      ...TinaRemark
    }
  }
`
```

The above code is a component that displays information about Star Wars movies. For now, it just displays a title, but it could also display the release date and the crawl text in the intro to the film. But that’s another story in a galaxy far far away ... ⭐

The first step in this example is to import the `remarkForm` hook from the Gatsby plugin `gatsby-tinacms-remark`. This is the plugin that _makes TinaCMS work with Markdown files_.

There’s no need to do any additions to the code inside of the component itself. It could be any component — functional or class — structured in the way you want it. The only thing you have to do with the component itself is to wrap your component with the `remarkForm` HOC when you export it.

One more thing you have to do before you are good to go is to add the GraphQL fragment `...TinaRemark` in your query. This is needed for TinaCMS to recognize your data and create the required editor fields in the TinaCMS sidebar. After that, you only have to start up your dev server to show the site and the Tina sidebar.

Easy enough isn’t it? Just three small steps and you’ll have a beautiful sidebar to edit your content on your site. 🤟

_But what if you want to use a Static Query and not a Page Query?_

### useLocalRemarkForm to the rescue!

We’ve learned that the `remarkForm` HOC won’t work on Static Queries. So we’ll have to find another solution for using Static Queries with TinaCMS.

**Great news!**

The `remarkForm` component is essentially a "wrapper" for the `useLocalRemarkForm` hook. 👀 It takes in a component as an argument, calls `useLocalRemarkForm` with the Page Query data and returns a new component with the query data and TinaCMS connected to it.

We can use the `useLocalRemarkForm` hook directly, without using the `remarkForm` HOC. This can be useful with Static Queries or if we just prefer working with hooks!

Take a look at the code example below to get an idea of how `useLocalRemarkForm` works.

```javascript
// 1. Import useLocalRemarkForm hook
import React from ‘react’;
import { useLocalRemarkForm } from ‘gatsby-tinacms-remark’;
import { useStaticQuery } from ‘gatsby’;

const StarWarsMovie = () => {
  // 2. Add required TinaCMS fragment to the GrahpQL query
    const data = useStaticQuery(graphql`
      query StarWarsMovieById {
        markdownRemark(fields: { id: { eq: "sw-01" } }) {
          id
          html
          frontmatter {
            title
            releaseDate
            crawl
          }
          ...TinaRemark
        }
      }
    `);
  // 3. Call the useLocalRemarkForm hook and pass in the data
  const [markdownRemark] = useLocalRemarkForm(data.markdownRemark);
  return <h1>{markdownRemark.frontmatter.title}</h1>
}

export default StarWarsMovie;
```

This is just an example component illustrating how `useLocalRemarkForm` works. In the real world, it would not be an optimal solution using a Static Query for this. That’s because, as you can see, you can’t use variables inside the `useStaticQuery` hook to make it dynamic. You have to hardcode the movie id. So this query will work for that specific movie only, which is no good.

Let’s break down what’s happening here:

1. We import the `useLocalRemarkForm` custom hook so we can use it in our component.
2. Just as before, the `...TinaRemark` fragment is needed in the GraphQL query. So we add that one there.
3. When we’ve got our data back from the Gatsby `useStaticQuery` hook we can call the TinaCMS `useLocalRemarkForm` hook with that data. This hook will return an array with two elements. The first element is practically the data that we called the hook with. It has the same shape and is ready for us to use in our component. The second element is a reference to the Tina form. We don’t need that one so we don’t destructure it out as we do with the `markdownRemark`.

If you're wondering about this line:

```javascript
const [markdownRemark] = useLocalRemarkForm(heroData.markdownRemark)
```

It is an example of [ES6 destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment). As we get an array with two elements back, I destructure out the first element (which is our data) and name it `markdownRemark`. You can name it whatever you want.

### RemarkForm - The Render Prop Component

You can’t use React Hooks on class components. That’s why Tina provides a [`RemarkForm`](https://tinacms.org/guides/gatsby/git/create-remark-form#2-the-render-props-component-remarkform-the-render-props-component-remarkform) component that uses the [Render Props](https://reactjs.org/docs/render-props.html) pattern.

This component works with both Page and Static Queries. I will show how to use it with a Page Query below.

Take a look at below example:

```javascript
// 1. import the RemarkForm render prop component
import { RemarkForm } from '@tinacms/gatsby-tinacms-remark'

class StarWarsMovie extends React.Component {
  render() {
    /*
     ** 2. Return RemarkForm, pass in markdownRemark
     **    to the remark prop and pass in what you
     **    want to render to the render prop
     */
    return (
      <RemarkForm
        remark={this.props.data.markdownRemark}
        render={({ markdownRemark }) => {
          return <h1>{markdownRemark.frontmatter.title}</h1>
        }}
      />
    )
  }
}

export default StarWarsMovie

// 3. Add the required ...TinaRemark fragment to your Page Query
export const pageQuery = graphql`
  query StarWarsMovieById($id: String!) {
    markdownRemark(fields: { id: { eq: $id } }) {
      id
      html
      frontmatter {
        title
        releaseDate
        crawl
      }
      ...TinaRemark
    }
  }
`
```

Ok, yet again, let’s see what’s happening here:

1. We import the `RemarkForm` component for us to use in our code.
2. In our return statement we return the `RemarkForm` component and pass in it's predefined, and required props. The remark prop provides `RemarkForm` with the Markdown data sourced from the Page Query. The render prop gets the JSX that we want to render through a function, or a render prop. `RemarkForm` will hook up Tina for editing the data and then render whatever is specified in the render prop function.
3. Just as before we have to add the `...TinaRemark` fragment to the Page Query.

## Next steps

**That's it**! Three ways of using Tina for editing Markdown files in Gatsby. 🎉

In this post, we learned about how to _set up Tina with both Static Queries and Page Queries in Gatsby_. We also learned about three different ways to edit Markdown with Tina depending on your type of React component.

This is just the basics to get you started. If you like Tina and want to learn more you should check out the [official docs](/docs/). There’s a lot more stuff to read there and some interesting use cases.

For example, you can learn how to apply [inline editing](/docs/ui/inline-editing) and also how to [customize the form fields](/docs/plugins/fields) in the Tina sidebar.

Tina is a great addition to the React ecosystem and static site generators like Gatsby. It gives your site a pleasant and easy way to edit and interact with your content.
I’m thrilled to see how big TinaCMS will be and what it can do as it evolves!

## More reading and learning

Watch my tutorial for [Tina & Gatsby](https://www.youtube.com/watch?v=eZWJ9ZtF61A&t=265s). Also catch me on Twitter — [@weibenfalk](https://twitter.com/weibenfalk), [Youtube](https://www.youtube.com/c/weibenfalk), or on my [website](https://www.weibenfalk.com).
