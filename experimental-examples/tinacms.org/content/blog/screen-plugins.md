---
title: What are Screen Plugins?
date: '2020-04-09T07:00:00.000Z'
author: Nolan Phillips & Kendall Strautman
draft: false
consumes:
  - file: /packages/tinacms/src/plugins/screen-plugin.ts
    details: Explains the screen plugin interface properties
next: content/blog/software-engineering-daily-podcast-tinacms.md
prev: content/blog/designing-an-extensible-styling-system.md
---

Plugins are a powerful concept. In general plugins are used to extend core functionality of a base system. While many plugin systems are static, TinaCMS is powered by a [dynamic plugin system](https://tinacms.org/blog/dynamic-plugin-system/). In this approach, plugins are added and removed programmatically. This dynamism allows developers to add and remove CMS features based on the context.

If you’ve worked with Tina, you may have already used a few plugins without realizing it. The most common plugin used in `tinacms` is the `FormPlugin` which adds forms for editing content to the [sidebar](https://tinacms.org/docs/concepts/sidebar).

Another plugin worth noting is the [`ContentCreatorPlugin`](/docs/plugins/content-creators). This plugin provides the foundation for creating new data source files.

One of the more recent additions has been the [`ScreenPlugin`](/docs/plugins/screens), which is the topic of this blog. Screens allow you to render modal UI and handle various content editing needs. For example, one might use a _Screen Plugin_ to register a form to edit 'global site data'.

## What's that?

The **`ScreenPlugin` has three main pieces**: a name, an icon, and a React Component.

For example with a `GlobalFormPlugin` (a type of screen plugin), the name and the icon are used to list the screen plugin in the global menu.

![global-menu](/img/tina-grande-global-form.jpg)

When the user clicks on the menu item, it opens a screen in which the React Component is rendered. _Think of a screen as an empty canvas_, it provides the space to create an editing interface beyond the sidebar.

There are two potential layouts for a screen plugin: `fullscreen` and `popup`. You can choose to utilize either depending on the purpose of the _screen_.

![full screen plugin](/img/blog/screen-plugin/fullscreen-screen-plugin.png)
![popup screen plugin](/img/blog/screen-plugin/popup-screen-plugin.png)

## Let's make a basic screen plugin!

To really get a feel for the way screen plugins work, let’s dive into setting one up.

**Here's an example layout:**

```js
import { Quokka } from './cute-marsupials'

export default function Island({ smiles }) {
  return <Quokka>{smiles}</Quokka>
}
```

Here we have an _Island_ component that renders a smiling quokka.

![Quokka Photo](/img/blog/screen-plugin/quokka.jpg)

> [Quokkas](https://www.reddit.com/r/Quokka/) are ridiculously cute marsupials found on islands off of Australia. **Yes, they're real.**

Lately, a trend has developed to take [jovial selfies](https://www.nationalgeographic.com/news/2015/3/150306-quokkas-selfies-animals-science-photography-australia/) with these critters.

Let's make a quokka selfie screen plugin for the tourists. We'll set this up in three steps:

1. Import the `useScreenPlugin` hook from `tinacms`
2. Create our `SelfiePlugin`
3. Use that plugin in our App

```jsx
// 1. Import `useScreenPlugin`
import { useScreenPlugin } from 'tinacms'
import { Quokka } from './cute-marsupials'

// 2. Define the screen plugin
const SelfiePlugin = {
  name: 'Quokka Selfie',
  Icon: () => <span>🐨</span>,
  layout: 'popup',
  Component() {
    return <img src="/img/quokka-selfie.jpg" />
  },
}

export default function Island({ smiles }) {
  // 3. Use the plugin
  useScreenPlugin(SelfiePlugin)

  return <Quokka>{smiles}</Quokka>
}
```

For the icon, we inserted a little koala emoji (distant cousin of the quokka), but you replace that with an `svg` or `png`.

Let's see the selfie screen plugin in action. Using it will add a new item to the global menu.

![quokka selfie plugin global menu](/img/blog/screen-plugin/quokka-selfie-global-menu.png)

Clicking on the menu item will open a popup modal where our Component will render.

![quokka selfie screen plugin](/img/blog/screen-plugin/quokka-selfie-plugin-full.png)

Tada! It works. We made a plugin to brighten everyone's day ☺️.

## So what can I do with Screen Plugins?

Screen plugins are just React Components, so the screen plugin _world is your oyster_, so to speak. You could make magic 8 ball 🎱 screen plugin to help the content team decide where to order lunch. It's all deadly.

If nothing else, I hope this blog introduced you to quite possibly the [happiest creature alive](https://www.reddit.com/r/Eyebleach/comments/cz30uy/the_quokka_possibly_the_happiest_animal_on_earth/). We could all use a little quokka in our lives right now. Be well 🖖!
