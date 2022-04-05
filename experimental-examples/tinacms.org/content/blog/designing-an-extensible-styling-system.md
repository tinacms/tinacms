---
title: 'Designing an Extensible Styling System'
date: '2020-03-23T00:00:00.000Z'
author: Scott Byrne
next: content/blog/screen-plugins.md
prev: content/blog/tinacms-ui-whats-next.md
---

## Writing an adaptable UI is hard.

When you're writing code for a quickly changing project, you want that code to be cheap and replaceable. [Styled Components](https://styled-components.com/) allow us to write styles right alongside the components they're used for. It lets us easily move components around — or completely replace them — with minimum effort.

All these components — spread across many packages and files — needed a single source of truth. Colors, padding sizes, shadows, fonts… everything had to be consistent between TinaCMS components. Styled Components offered a powerful theming system that was a natural fit for the problem. We could provide theme context to any component looking to use common Tina styles.

Initially, Tina UI was contained within an isolated sidebar inside an iframe. As we moved towards editing content inline with Tina, field specific UI would be displayed right on the user's website, not in an isolated TinaCMS container. Since the theme object was being constructed within Tina, providing the current theme to in-page components was a challenge. Theme changes — configured through gatsby-config.js — could only be made globally, and would only take effect when the server was restarted. We needed something more suited to the evolving TinaCMS project.

## Enter CSS custom properties.

[CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) bring variables to the CSS masses! Instead of being compile time or dependent on JavaScript, they can be defined and used in plain CSS. CSS custom properties are declared and scoped to a selector, like `:root`. You can override existing properties by redeclaring them, either at the same scope or on a child. In the case of TinaCMS, that means you can easily customize and use our theme in your own project, without having to compile our styles.

Here's an example where we override the primary color (blue by default) and use it in a custom button:

```css
:root {
  --tina-color-primary-light: #eb6337;
  --tina-color-primary: #ec4815;
  --tina-color-primary-dark: #dc4419;
}

.my-button {
  background-color: var(--tina-color-primary);
  border-radius: var(--tina-radius-big);

  :hover {
    background-color: var(--tina-color-primary-light);
  }
}
```

Reducing the complexity of our theme system makes it easier for us to adapt the UI to new features, but also makes it easier for those integrating TinaCMS with their project.

> [Take a look at the docs](https://tinacms.org/docs/ui/styles) for `@tinacms/styles` for a full reference of available properties.

## What's the next challenge?

Styled Components are easy to use and generally a pleasure to work with, but unfortunately require a runtime. While this isn't an issue in an app or website, it's problematic for a library. It's possible the library consumer is already using a different version of styled components, or even a different css-in-js library that requires a separate runtime. Ideally TinaCMS styles would be framework agnostic with no runtime, consumable by any HTML page. Moving our theme system to CSS custom properties was the first step in aligning our style system with the needs of our project.
