---
title: "TinaCMS UI: What's next?"
date: '2020-03-13T00:00:00.000Z'
author: Nolan Phillips
next: content/blog/designing-an-extensible-styling-system.md
prev: content/blog/introducing-visual-open-authoring.md
---

This week we deployed [Visual Open Authoring](https://tinacms.org/blog/introducing-visual-open-authoring 'Introducing Visual Open Authoring') on the TinaCMS website to make the editing experience for ourselves and all the community members totally amazing!

You may have noticed that the editing interface on [tinacms.org](http://tinacms.org) is different than what's in our videos and what you have running locally. This new Toolbar was an experiment we made directly in the [tinacms.org repository](https://github.com/tinacms/tinacms.org 'Github: tinacms.org'). In this post, I will talk about why we took this approach and the next steps in making the Tina Toolbar available for everyone.

![TinaCMS UI Options](https://res.cloudinary.com/forestry-demo/image/upload/q_100/v1584115021/TinaCMS/sidebar-toolbar.jpg)

## Tina is not a CMS

It is not an application. It is not intended to be an all-in-one solution. It is a toolkit for building content management directly into your apps and websites. This philosophy has tremendous implications on the architecture of the TinaCMS codebase. For example, the user interface that we provide is only the _default option_.

In order to create an amazing inline editing experience for [tinacms.org](http://tinacms.org/), we decided to create an experimental UI. We hid the Sidebar and replaced it with a persistent Toolbar at the top of the screen. This new UI was an instant hit with our team! The Toolbar gives us easier access to common actions without having to open and close the Sidebar. We still love the Sidebar, it's easier to set up and is great when you don't want or need inline editing, but it's not always the best experience.

Unfortunately, you'll have to wait a little bit to get your hands on the new Toolbar. The creation of the Toolbar was an incredibly exciting project for us. We were able to totally re-imagine the user experience of TinaCMS _without having to change any code in the main repository_. This allowed us to quickly experiment with the interface without considering how it could fit into the overall project. Because of this, it only took a few days to get it production-ready. This project validated many of our code design decisions by showing that we could experiment and innovate on top of TinaCMS without having to tear it apart.

Now that Open Authoring with [tinacms.org](http://tinacms.org/) is published, we're getting ready to make it available for everyone. Kendall has already moved over the [new Inline Editing components](https://github.com/tinacms/tinacms/pull/871). Figuring out how the Toolbar will fit in the TinaCMS ecosystem is next. This post lays out the plan for how that will be done.

## _tinacms_ as a quick-start package

Currently, the `tinacms` package implements a number of features directly. The Sidebar, Modals, Alerts, and Screen Plugins are all defined directly here. After this change, `tinacms` will simply be the "quick-start" package for developers looking to get started with Tina as fast as possible. The sole purpose of the `tinacms` package will be to provide a pre-configured CMS instance along with a few simple components that add the CMS, Alerts, Modals, Screens, and either the Sidebar or the Toolbar to the website. This change will give newcomers to Tina the ability to get started quickly, but it will also give other developers the ability to optimize and modify Tina to fit their needs.

A large problem with `tinacms` is the impact it has on the bundle size of the developer's website. This will be made worse when we start adding more features to the toolbar. By breaking these pieces up, developers can solve this problem by taking advantage of dynamic imports and code splitting in their application.

This separation will give developers the ability to opt-out of the pre-defined UI and roll their own. This will give developers the option to deeply integrate the CMS into their website and opens Tina up to the possibility of great UI/UX innovations.

## Upcoming Packages

The following packages will be introduced in this process:

- `@tinacms/media`: the API for interacting with the [CMS media store](https://tinacms.org/docs/media). – [#878](https://github.com/tinacms/tinacms/pull/878 'feat: introduce @tinacms/media')
- `@tinacms/alerts`: the API for creating [CMS alerts](https://tinacms.org/docs/ui/alerts) – [#883](https://github.com/tinacms/tinacms/pull/883)
- `@tinacms/react-alerts`: the components for rendering CMS _alerts_ – [#883](https://github.com/tinacms/tinacms/pull/883)
- `@tinacms/react-forms`: the components used to automatically build _forms_
- `@tinacms/react-modals`: the components for creating _modals_ for the CMS – [#911](https://github.com/tinacms/tinacms/pull/911)
- `@tinacms/react-sidebar`: the sidebar components
- `@tinacms/react-toolbar`: the toolbar components
- `@tinacms/react-fields`: Primitive field plugins i.e. Text, Textarea, Select, Number, Toggle, Block, Group, Group List
- `react-tinacms-color`: Color Field plugin
- `react-tinacms-date`: Date Field plugin
- `react-tinacms-editor`: HTML and Markdown field plugins + the Wysiwyg itself
- `react-tinacms-image`: Image plugin

### Why separate _alerts_ and _react-alerts_

TinaCMS is designed to be framework agnostic. We started with React as the main implementation because it is the framework that the team is most familiar with. This separation allows us to separate the domain from the view library so that TinaCMS will be accessible to more use cases.

### Why are some packages scoped to _@tinacms_ ?

Packages are scoped to `@tinacms` when they are fundamental pieces of content management. The rules on this are not well defined yet.

## Want to Get Involved?

Join the [TinaCMS Community Forum](https://community.tinacms.org 'TinaCMS Community Forum') if you have any questions or comments or if you want to get involved with TinaCMS development.
