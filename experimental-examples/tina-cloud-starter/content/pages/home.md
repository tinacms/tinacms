---
title: Tina Cloud Starter
blocks:
  - headline: Welcome to the Tina Starter
    text: >
      This project is set up to show you the basics of working with Tina. You're
      looking at the landing page, which pulls content from
      `content/pages/home.md`, components from components/blocks, and puts them
      all together in `pages/[filename].tsx`, all based on a config
      `tina/config.tsx`.
    actions:
      - label: Get Started
        type: button
        icon: true
        link: /posts
      - label: Read Blog
        type: link
        icon: false
        link: /posts
    image:
      src: /uploads/unsplash-75EFpyXu3Wg.jpg
      alt: >-
        Photo of palm trees at sunset by Adam Birkett -
        unsplash.com/photos/75EFpyXu3Wg
    color: default
    _template: hero
  - items:
      - icon:
          name: BiCodeBlock
          color: red
          style: float
        title: Amazing Feature
        text: >-
          Aliquam blandit felis rhoncus, eleifend ipsum in, condimentum nibh.
          Praesent ac faucibus risus, eu lacinia enim.
      - icon:
          name: BiLike
          color: primary
          style: float
        title: This Is a Feature
        text: Vestibulum ante ipsum primis in faucibus orci luctus et ultrices.
      - icon:
          name: BiPalette
          color: green
          style: float
        title: Configurable Theme
        text: >-
          Edit global theme configuration with Tina. Change your theme's primary
          color, font, or icon set.
    color: tint
    _template: features
  - quote: >-
      There are only two hard things in Computer Science: cache invalidation and
      naming things.
    author: Phil Karlton
    color: primary
    _template: testimonial
---



