---
date: '2021-04-14T13:59:53+02:00'
author: Frank Taillandier
last_edited: '2021-04-15T07:46:05.497Z'
title: 2021 Q1 Tina updates
---

We are regularly improving Tina to provide an effective developer experience _and_ a unique visual content editing experience. Latest additions are the result of listening to the feedback of the community as well as scratching our own itch.

Let’s take a closer look at some of the most impactful recent changes in Tina core library.

## Radio Group Field 🆕

Editors are now able to pick from a list of options, the [radio group field](/docs/plugins/fields/radio-group/) comes in two flavors: `radio` and `button`, they are displayed horizontally by default, you can opt-in for the vertical variant.

![Radio Group field in horizontal direction (default)](/img/fields/radio-group-field-horizontal-radio.gif)
![Radio Group field Button Variant (horizontal)](/img/fields/radio-group-field-horizontal-button.gif)

## Search and filter blocks 🆕

When your page template offers more than 10 components to pick from, editors can type and [filter from the blocks menu list](https://github.com/tinacms/tinacms/pull/1772). We have plans to make picking blocks a more visual experience.

## Duplicate blocks 🆕

A small, yet big, win for inline editing, you can now duplicate a block with a single click.

![When using TIna Inline Block, click on the duplicate icon to insert the same block below.](/img/blog/duplicate-block-tinacms.gif)

## Rethinking Inline Editing 🤔

We started reevaluating our approach to how Tina does inline editing. We refactored the code to take advantage of [events and references](https://github.com/tinacms/tinacms/pull/1749) to provide a [new API](https://github.com/tinacms/tinacms/blob/master/packages/react-tinacms-inline/README.md#usefieldref-ref-based-inline-editing). This work is far from done and is currently only available through a feature flag, as this will be subject to more changes.
We’ll share our views in an upcoming post on what the future of inline editing will look like in Tina from a developer perspective.

Related to this change, we decided to remove drag-and-drop of inline blocks for now. There were some cases where it was creating issues but we might revisit this feature later when we have better inline editing. Now, you can move blocks around a page with up and down block controls, which shouldn't require too many clicks in most cases.

You'll soon be able to [resize the sidebar](https://github.com/tinacms/tinacms/pull/1795#issue-615395547) as you see fit.
This makes the writing experience much more enjoyable when you write long format in the WYSIWYG editor. ↔️

## Next.js and Tailwind Demo 👀

Our [default demo](https://tina-demo-two.vercel.app/iframe/) is based on Next.js and Tailwind CSS. It currently showcases how you can set up Tina to provide: theme colors, component variants, dark mode, responsive blocks, etc. In the near future, we’ll dedicate a post on how we built this demo, so you will be able to dig in further and learn from it. For now, feel free to play around and [let us know if you have any feedback](https://github.com/tinacms/tina-tailwind-inline-demo/issues).

## Contentful plugin 🔌

Our homepage makes it very clear that Tina can potentially work with any backend, we already released [a guide to work with Strapi](/guides/nextjs/tina-with-strapi/overview/). We did also experiment with Contentful and published [a plugin](https://github.com/tinalabs/tinacms-contentful) for Tina to work with content fetched from their Content API. If you’re working with Contentful, feel free to test the plugin and [leave us feedback](https://github.com/tinalabs/tinacms-contentful/issues).

## Community 💜

### New Core Team Members

[Jeff](https://github.com/jeffsee55), [Chris](https://github.com/Enigmatical), and [Jack](https://github.com/jbevis) joined the core team. We’re very happy to welcome them to help us unleash the potential Tina has to offer.

### Some stats 📈

Our community activities are now tracked in [Orbit](https://orbit.love/) 💜, in order to help us better build better relationships with you. Warm thanks to [Nicolas](https://github.com/phacks/) from the Orbit team for helping out setting things up.

![Member Activity in the Tina Community for 2021 Q1 in Orbit](/img/blog/orbit-members-2021-q1.png)Orbit makes it easy to reflect on the community’s activity, you can easily see when you got on the front page of Hacker News 😊.

Shout out to our most active community members for 2021 Q1: [Joe Innes](https://github.com/joeinnes) 👏, [Matthew Francis Brunetti](https://github.com/zenflow) 👏, [Austin Condiff](https://github.com/austincondiff) 👏, [Hirvin Faria](https://github.com/hirvin-faria) 👏 and [Chadd Poggenpoel](https://github.com/Chizzah) 👏.

Our open source project has reached some new milestones:

- [Tina](https://github.com/tinacms/tinacms) has been starred by more than **6K** people on GitHub 🌟
- [tinacms core package](https://www.npmjs.com/package/tinacms) has been downloaded more than 250K times 📦

🙏 Thanks for your interest, we’re just getting started here!

## One more thing... ⏳

In order to enhance the Tina ecosystem, our team is currently working on a new open source tool to ease the way you can do structured content management while keeping control of your content in your Git repository. More on that next week!

[Subscribe to our blog](/rss.xml) or [newsletter](https://gmail.us20.list-manage.com/subscribe?u=1fea337bee20e7270d025ea8a&id=c1062536a1) to be the first to know about all our new and exciting developments.
