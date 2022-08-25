---
title: 2021 - A year in Review
date: '2021-12-21T04:00:00.000Z'
last_edited: '2021-12-21T04:00:00.000Z'
author: James Perkins
---

As the year is winding down, the team and I spent some time reflecting on how far Tina has come from the beginning of the year. At the beginning of 2021 TinaCMS was a new and growing open-source project that the Forestry team was excited to build. That project, in many ways, looked very different from the TinaCMS you know today. This year's journey involved some significant changes to the open-source project but our mission has remained the same: to deliver an open-source CMS that provides a 10x experience for the world's best web developers and content editors.

Earlier this year we received a lot of feedback from both small and large companies using TinaCMS in that early phase. We learned that Tina was too open-ended and was trying to do too much. We decided to put certain constraints in place that narrowed Tina's focus but provided a better overall experience for more users. We chose Next.js as Tina's preferred framework for now (instead of Gatsby and others), focused on content stored in Git instead of supporting any data store, and replaced the in-page editing experience for a side-by-side editing experience that you see now in order to improve the overall developer experience. Also, we added a [GraphQL API](/docs/graphql/overview/) to TinaCMS that gives you all the benefits of Git-backed content (version control, content-ownership, branching, etc) but also adds a structured API that can easily be queried.

Now, here we are in December, and Tina has evolved significantly. We're truly proud of what we accomplished in 2021. We narrowed Tina's focus and built a solid foundation for a future where Git-backed content editing will be game-changing.

In the new year, we look forward to sharing our vision for 2022 and talking about all the exciting features we have planned for TinaCMS.

<CreateAppCta
  ctaText="Test"
  cliText="Thing"
/>

## January - March

During the first part of 2021, we were still finding our feet as a product, we had a vision of easily editable content regardless of the CMS a user had chosen. A lot of work went into improving our current experience around features we had, and adding new ones that we thought were important to the community. We also added 3 members to the team to help drive the developer and user experience.

## April 2021

April was the launch of the cloud product. Scott Gallant (CEO) made the announcement on April 21, 2021, introducing Tina Cloud, speaking to the importance of git-backed content powered by contextual editing. We wanted to offer a first-in-class experience using git and allowing users without GitHub to be able to edit content. If you are interested in reading the original announcement again, here is the [link](/blog/tina-cloud-a-headless-cms-backed-by-git/). As we were revisiting, we were really excited to see where we are just 8 months later.

## May 2021

### All in on Next.JS

May is when we went "all in" on using Next.js, the biggest appeals to us were:

- Dynamic imports
- Flexible data fetching
- Next.js was becoming the leader in the Jamstack and had a great community.

Working with a single framework helped us iterate quickly and focus on the right problems versus worrying about edge cases and nuances with each framework we supported.

## I was hired as a Developer Advocate

We felt that we were on track and that we need more developers using Tina so that we could keep the momentum of innovation moving forward. At the end of May we hired a Developer Advocate (hey, that's me!) to connect with our audience (hey, that's you!), we felt ready to start building our community. Prior to being hired, I had been interested in the concept of Tina and what Tina was doing after researching it for a video. I will never forget what I said in that video,

"Tina is really powerful and I am going to show you only the surface of what it can do."

After talking to the team about the vision of Tina, I was all in, I didn't want to do or go anywhere else. It felt like just yesterday, but here we are seven months later and I still feel exactly the same!

## June 2021

### Tina Cloud launches into alpha

June 2nd, 2021 we announced to the community that Tina Cloud was in public alpha, and we encouraged anyone who wanted to see the future of content editing and management to give it a shot.

![Tina Alpha Tweet](https://res.cloudinary.com/forestry-demo/image/upload/v1640092818/blog-media/year-in-review/alpha.png)

You all took us up on our offer, users spiked, commits were made, and feedback started to come in. We felt the beginnings of a community that wanted and cared about Tina. Your feedback went directly to the team and into brainstorming product meetings.

## July 2021

One of the most common and most impactful pieces of feedback we received was around media management. You wanted to know why you couldn't have your media managed using Tina + Cloud. We knew that this was a big hurdle for users, so we immediately started working on a solution and introduced the integration with Cloudinary. We chose Cloudinary because:

1.  Support for all image types
2.  Optimized images
3.  Next Image loves Cloudinary

We wanted to make it as easy as possible to add Cloudinary support for your site. So we created `next-tinacms-cloudinary` which takes care of the heavy lifting, and with minimal integration your site is ready!

## August 2021

In August we made the biggest announcement since I started at Tina. We placed the product in beta. I remember the buzz around the "office" as we got closer and closer to the announcement. There was a lot of hard work that went into our beta release, so the team were excited to see what the world though of these changes. We had no idea how we were going to fit it all in a blog post, the announcement wasn't just about changing the words alpha to beta we also had:

- Better documentation
- A new CLI
- Better guides
- Better starters
- Caching improvements
- Creating @tinacms/toolkit
- Vercel integration
- Dashboard overhaul
- Changes to content modeling

![Beta Tweet](https://res.cloudinary.com/forestry-demo/image/upload/v1640092818/blog-media/year-in-review/beta.png)

We also hired Kelly to help with our Cloud offering and Logan to help with our open-source product. Logan had already been working as an intern but he was an integral part of the team and we wanted him to work at Tina after he graduated.

## September 2021

September was the hardest month for the team at Tina, as our team member Frank passed away unexpectedly. His amazing ability to connect with anyone he met, from users to team members led him in his mission to bring together the user, the product, and the Jamstack. He is missed, but we talk about his contributions to Tina regularly.

## October 2021

### MDX Support

Up to this point, we had been focusing heavily on developers, but we wanted to ensure that we were also building for the content editors. We introduced MDX support for Tina so that developers can create all the reusable components your team needs and allow your content teams to reuse those components with a single click of a button. This feature really speaks to the heart of Tina, providing both the developers and content editors with seamless experiences.

### Documentation Starter

We also introduced a Tina Documentation Starter that allows documentation teams to get started quickly by giving them the ability to create new pages and edit pages with a single click. This starter is also powered by MDX so not only can you get started with a single click, you can add all the reusable components that your teams might need for creating fantastic documentation.

## November

### Documentation improvements

In November we set out to look at our documentation from all sides to ensure that you, no matter how you wanted to use Tina, are getting the information that you need. We gathered the team and each person came with a different perspective informed by their experience, user research, and your feedback. This exercise resulted in vast improvements and polished documentation to get you whatever it is you need.

### Dashboard onboarding improvements

We also added the ability to log in with your GitHub account, making it easier to keep everything together. Through a simple quickstart flow, you can log in, pick one of our starters and have us deploy it for you. Essentially, this means you can test and play with Tina in minutes.

## December

December is usually a slower time of the year, but not with Tina. We still had some experimental features and a new way to get started with Tina that we wanted to get to you before the year ended.

### Barebones Starter

We introduced a new starter called "barebones" which gives you a minimal Next.js project with Tina. This allows you to start a new Tina project in a single step with a minimal Tina integration. Our starters prior to the barebones starter contained a lot of extra code for specific tasks, such as our documentation starter. We wanted to give you a good foundation without any additional code or dependencies.

### `create-tina-app`

We also introduced `npx create-tina-app` which allows you to set up a Tina application using a starter of your choice. As fellow developers, we understand that working locally is important and it allows you to investigate what is happening behind the scenes. With a single command, you can investigate Tina locally, make changes, and deploy later.

**Autogenerated GraphQL Client (experimental)**

Though we love graphQL, we understand that writing graphQL might be daunting for those who are not very familiar with it. To address this we introduced an experimental feature that allows you to use a client. This allows developers familiar with javascript to use the dot notion to get the data they need. For example:

```javascript
const tinaProps = await client.getPostsDocument({relativePath:"helloWorld.md";});
```

You can see how to use this experimental feature in our [GitHub](https://github.com/tinacms/tinacms/blob/main/packages/%40tinacms/cli/GeneratedClientDocs.md)

### Branching Support (experimental)

Allowing Tina-powered sites to switch to any branch is something that we have been working on for a while. Branching is so important to developers and content teams because if they want to launch a new feature or post they certainly don't want it live right away. We wanted to make sure we did it right, by making the user experience easy to navigate, and we just released it as an experimental feature. You can find out how to implement this in our [GitHub repository](https://github.com/tinacms/tinacms/tree/main/packages/%40tinacms/toolkit/src/plugins/branch-switcher).

## The next phase

At the beginning of the year, Tina was an experimental open-source project that was too open ended and was hard to maintain all of the moving pieces. We were supporting dozens of different packages and from the feedback we received, this wasn't the best approach. After making hard decisions on how to refine our approach, we now have a solid product that is seeing growing usage in production sites.

In our next post, we're going to describe where this is all going and our plan for Tina in 2022. The whole team is truly excited to enter the next phase of our project and hope you will check it out and give us honest feedback. We want to hear about your projects that use Tina and anything we can do to make it easier, faster or better.

To keep up to date with Tina goings-on make sure to follow [@tina_cms](https://twitter.com/tina_cms) on Twitter. Want to chat with the team? Join the [Discord](https://discord.gg/njvZZYHj2Q)
