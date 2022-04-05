---
title: Introducing the Documentation Starter powered by MDX.
date: '2021-11-02T08:00:00-04:00'
author: James Perkins
last_edited: '2021-11-02T08:00:00-04:00'
---

When we released our [MDX Support](/docs/mdx/), we wanted to create a real-world application that showed the power of Tina and MDX. We know how important documentation is to teams and that the market’s current offerings lack features that bring collaboration.

![Docs_Starter_Example](https://res.cloudinary.com/forestry-demo/video/upload/v1638887594/blog-media/Docs_Starter_Example.gif)

# The technology behind our Documentation Starter

Creating a documentation starter required some investigation. We wanted a starting point that would allow us to add all the features we believe are important to documentation, such as an easy way to add videos without using iframes or callouts. So we decided that Smooth Doc would be the perfect starting point.


## Smooth Doc

[Smooth Doc](https://smooth-doc.com/) was created by [Greg Bergé](https://twitter.com/neoziro) who also created xstyled components and spends a lot of time creating products. He needed a great documentation site that he could reuse over and over again. The original Smooth Doc is built on Gatsby and uses MDX under the hood to power the entire site, another open-source creator turned Smooth Doc into a Next site.

Smooth Doc has a lot of features, but we removed some,  such as carbon ads, so that we could deliver a streamlined product for our starter.


## MDX

We are big fans of markdown and have just introduced the ability to support MDX. This allowed us to create components that can be easily used throughout a documentation site we included:

### [Hero](https://github.com/tinacms/tina-docs-starter/blob/main/blocks/hero-block.js)

![CleanShot 2021-11-02 at 09.17.24.png](https://res.craft.do/user/full/c67cad1b-6dc6-4909-0f8e-19d468ba9fd4/doc/F38A8651-6C07-422F-A3E4-DBB7464B4570/0509A88A-23B1-4B6C-AD87-3A0592EAB965_2/CleanShot%202021-11-02%20at%2009.17.24.png)

### [Button](https://github.com/tinacms/tina-docs-starter/blob/main/components/Button.js)

![CleanShot 2021-11-02 at 09.18.07.png](https://res.craft.do/user/full/c67cad1b-6dc6-4909-0f8e-19d468ba9fd4/doc/F38A8651-6C07-422F-A3E4-DBB7464B4570/6E8FBA41-E9EF-4E94-8A8B-0B659D9054F4_2/CleanShot%202021-11-02%20at%2009.18.07.png)

### [Video player](https://github.com/tinacms/tina-docs-starter/blob/main/pages/docs/%5Bslug%5D.js#L28)

![CleanShot 2021-11-02 at 09.25.50.png](https://res.craft.do/user/full/c67cad1b-6dc6-4909-0f8e-19d468ba9fd4/doc/F38A8651-6C07-422F-A3E4-DBB7464B4570/5370BD6C-2B6A-4915-9D31-AF1E21A67B93_2/CleanShot%202021-11-02%20at%2009.25.50.png)

### [Features](https://github.com/tinacms/tina-docs-starter/blob/5c2448a63dea0b178eaf6b6c17ec10417c3fda78/blocks/features-block.js#L10)

![CleanShot 2021-11-02 at 09.31.27.png](https://res.craft.do/user/full/c67cad1b-6dc6-4909-0f8e-19d468ba9fd4/doc/F38A8651-6C07-422F-A3E4-DBB7464B4570/A48D9265-24B7-4096-B0CA-E35573D99338_2/CleanShot%202021-11-02%20at%2009.31.27.png)

### [Callouts](https://github.com/tinacms/tina-docs-starter/blob/5c2448a63dea0b178eaf6b6c17ec10417c3fda78/blocks/callout-block.js)

![CleanShot 2021-11-02 at 09.32.00.png](https://res.craft.do/user/full/c67cad1b-6dc6-4909-0f8e-19d468ba9fd4/doc/F38A8651-6C07-422F-A3E4-DBB7464B4570/06AE2D56-FB1D-49BA-A5E2-74C98022B81E_2/CleanShot%202021-11-02%20at%2009.32.00.png)

Each one of these components is easily edited by content teams with no development experience. We also give developers the ability to create their own components for their content teams, such as a newsletter signup.


## Tina

The MDX-powered Tina delivers a world-class experience for both developers and content teams. We allow you to create new documentation with ease by unlocking a contextual editing experience versus a traditional CMS.

## How the flow works for teams

Once you have cloned the repository, you can immediately start creating your documentation. There are a few scenarios to cover when working with Tina.

### Editing Content

When editing content, a user will just need to login via the /admin once they have been invited to the organization. Once they are in edit mode, they can add, remove, or edit any content on the page.

### Adding new components

1. Create a new component in the `components` folder
2. Import the component to the `[slug].js` file and add it to the components object.
3. Add the editable component to the `schema.ts` file
4. The Component is now ready to be used.

### Creating a new documentation pages

One benefit of using Tina is that you can create new pages without leaving your site, which allows teams to move swiftly. To add a new page to your documentation site just:

1. Make sure the user is in edit mode.
2. Select the large blue + in the top corner of the sidebar
3. Enter the file name and select Documentation from the Collection
4. New page is created and is ready to be edited.

We hope you enjoy the documentation starter and it unlocks your team’s productivity. If you have any questions or issues please make sure to join the [Discord](https://discord.gg/njvZZYHj2Q) or use our [GitHub Discussions](https://github.com/tinacms/tinacms/discussions).

To keep up to date with Tina’s goings-on make sure to follow [@tina_cms](https://twitter.com/tina_cms) and [@james_r_perkins](https://twitter.com/james_r_perkins) on Twitter.
