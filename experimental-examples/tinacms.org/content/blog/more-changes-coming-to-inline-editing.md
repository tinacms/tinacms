---
title: More Changes Coming to Inline Editing
date: '2021-01-13T10:16:45-05:00'
author: DJ
last_edited: '2021-01-13T15:45:05.411Z'
warningMessage: '**Update:** Inline editing is evolving and the current version is considered experimental, read more about [the evolution of inline editing](/blog/evolution-of-inline-editing/).'
---

It was around six months ago that we last dug deep into Tina's inline editing experience. At that time, we introduced new features and improved the UI of inline editing. Since then, there have been a few pain points we've run into from time to time.

Building is inherently exploratory, and now that we've established some solid idioms for _what_ inline editing should offer, we can step back and be more thoughtful about _how_ we accomplish those things.

We've done a poor job about being adequately transparent on our thoughts, but the developers among various teams at Forestry.io met multiple times over the past few weeks of 2020 to discuss the problems we want to solve with inline editing, and proposed potential solutions to solve them.

## Guiding Principles

For the next six weeks, the TinaCMS team will be delivering improvements to inline editing that align with the following principles:

### 1. Edit-Mode Markup Should be Identical to Production Markup (as much as possible)

We're trying to do something with TinaCMS that we haven't seen before. We're building a suite of JavaScript libraries that make it possible to integrate content controls directly into the code that displays that content. These controls should appear in an environment where the content can be edited, but should not exist in production where no editing occurs.

We've heard from many users that the additional markup inserted by `react-tinacms-inline` creates layout headaches that are hard to reckon with. We plan to introduce some changes that minimize and even eliminate this additional markup, making it possible to include inline editing more seamlessly in your production-ready layout code.

### 2. Inline Forms and Sidebar Forms Shouldn't Feel Like Different Things

Tina currently has two possible interfaces for editing content: _sidebar-based_, and _inline_.

Sidebar-based forms are set up by adding a `fields` key to a form's configuration object with an array of JavaScript objects that define each form field. Inline forms are set up by inserting the premade inline editing components into your layout code. These are two completely different mental models for how forms are created, which makes it difficult to use them in tandem.

Additionally, we are interested in providing more streamlined ways to configure inline forms. Being able to consolidate inline field configuration in a form's config object opens up a lot of opportunities for that.

## Follow our Progress

Check out the [GitHub project for this cycle](https://github.com/tinacms/tinacms/projects/9) to keep tabs on our work.
