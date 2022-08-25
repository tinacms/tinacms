---
title: 'Tina Data Layer: Performant Editing'
date: '2022-03-24T07:00:00.000Z'
author: James Perkins
prev: content/blog/from-cms-to-contextual.md
---

Tina has worked on the premise of direct interaction with Tina's GraphQL API and GitHub’s API. While this is a perfectly acceptable option, it does reduce performance slightly due to the nature of sending and retrieving data as “new” each time. 

The Tina team recently introduced a new optional data layer that sits between Tina and GitHub. In the future, this will be our default offering once it is out of the experimental stage. Our data layer buffers the requests between Tina and GitHub, increasing performance while editing your content. This blog post is going to explain how it works, what it does and what we have planned for the future!

<Youtube embedSrc="https://res.cloudinary.com/forestry-demo/video/upload/v1647955731/blog-media/data-layer/Before_perf_1.mp4"/>

## How to enable the Data Layer on your project

We made enabling and using the Data Layer with minimal development required. In fact you can enable the data layer by passing `--experimentalData` as a command line flag. The easiest way to make sure this happens is by editing your `package.json` script. 

```jsx
"scripts": {
    "dev": "yarn tinacms server:start -c \"next dev\"",
    "build": "yarn tinacms server:start -c \"next build\"",
    "start": "yarn tinacms server:start -c \"next start\" --experimentalData",
  },
```

Once the flag is added and the CLI has been run, Tina will update the generated schema letting Tina know you want to use the Data Layer.

> Once you have generated the Schema, you will need to commit the changes to GitHub for it to start working on the project.

## What does the Data Layer do to increase Performance?

Once the Data Layer is enabled on your project, we will automatically synchronize a copy of your repository with our secure cloud database. After Tina has run the initial indexing of your repository, Tina will automatically index new or updated content. This is done behind the scenes and you won’t notice that we are doing this, except the increase in performance when editing.

### When we might do a full re-index

In some cases we might have to fully re-index your project. This usually happens when the schema of your project has changed. For example:

 - Changes to `.tina\schema.ts`

 - Changes to the path to [.tina](https://tina.io/docs/tina-cloud/faq/#does-tina-cloud-work-with-monorepos)

 - Changes to the configured [repository](https://tina.io/docs/tina-cloud/dashboard/projects/#changing-the-repository)

 - New branches in GitHub

### Some things to note

This is still an experimental feature and the following things should be considered before enabling it on your project: 

1\. The indexing process isn’t exposed to the end user, which means it is possible that queries made during the indexing process could return incomplete results.

2\. GitHub has a API request limitation of 5000 requests per repository per hour. If you have an extremely large project you could hit this rate limit. If you have a repository with more than 1500 items, please do not activate this feature.

## The future

The team at Tina has plans for the following highly requested features as the Data Layer matures out of its experimental phase. In fact we have already begun working on some of the features mentioned below, so stay tuned! 

### More complex and advanced queries

The Data Layer opens up our GraphQL layer to be even more powerful, in the future Tina plans to offer: 

1. Pagination

2. Filtering

3. Sorting 

This means you will be able to reduce some of your calls if you don’t need a full data set. A good example of this would be where you only need 3 blog posts for a features section. In the current Tina integration, you need to retrieve all of the posts and filter them down after the fact. In the future you won’t need to do this. 

### Referential Integrity

With the introduction of the Data Layer it allows us to now be able to offer referential integrity. This will stop a content writer from accidentally making changes to content that could break other content or an entire site. The biggest benefit to a content user will be the ability to rename files or even delete content without breaking any existing references.
