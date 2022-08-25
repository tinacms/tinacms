---
title: What are Blocks?
date: '2019-12-18T03:15:26.426Z'
draft: false
author: DJ Walker
next: content/blog/editing-on-the-cloud.md
prev: content/blog/jamstack-denver-talk.md
---

> "There are only two hard things in Computer Science: cache invalidation and naming things."

This axiom, [attributed to Phil Karlton](http://www.tbray.org/ongoing/When/200x/2005/12/23/UPI), resonates with anyone who has spent any amount of time working with software. The post you're currently reading is, in some ways, about the latter problem.

One concept that we were eager to introduce to Tina is something we refer to as **Blocks fields**. We first [introduced this concept in Forestry](https://forestry.io/blog/sawmill-layout-composer-for-hugo-and-forestry/) some time ago, and we think it’s a powerful idea. The challenge with Blocks is that it’s kind of an abstract idea, and thus was tagged with a similarly abstract name.

**What are Blocks?** To put it succinctly, Blocks refers to a data structure that consists of an _array of unlike objects_. If you didn’t quite grok that, read on and I’ll do my best to explain why we introduced the Blocks concept to Tina and how it relates to other kinds of fields.

## Simple Fields and Compound Fields

The field types we’ve implemented in Tina can be broadly grouped into two categories: **simple fields** and **compound fields**. The designation for whether a field is simple or compound has to do with the kind of data that the field represents.

**Simple fields** are fields for data that can be represented as a single value, like a string or number. In computer science lingo, these are referred to as [scalar values](https://softwareengineering.stackexchange.com/questions/238033/what-does-it-mean-when-data-is-scalar). An example of simple fields in Tina would be the text field, color field, or toggle. Even the [markdown WYSIWYG](/docs/plugins/fields/markdown) can be considered a simple field, in spite of its complex frontend behavior, because the value it exports is just a big block of text.

**Compound fields** are fields that can’t be represented by a single value. Data exported by a compound field is _structured._ When saved, a compound field’s data will be represented by a non-scalar data type such as an array or object. Compound fields are **fields composed of other fields**. The compound fields in Tina include the Group, Group List, and Blocks.

## Groups and Group Lists

Tina’s **Group** field is a collection of **simple fields**. The fields that comprise a Group field can all be of the same type, or be of different types. Group fields are good for representing a single _entity_ that is comprised of smaller pieces of data.

Consider two ways to store a name in JSON. We could store the full name as a simple string:

```json
{
  "name": "DJ Walker"
}
```

Alternatively, we could contrive a simple data structure to store the name in a more semantic fashion:

```json
{
  "name": {
    "first": "DJ",
    "last": "Walker"
  }
}
```

We might use a simple text field in the first case, and a **Group** of two text fields for the second.

### Group Lists

<Diagram alt="diagram of linked circles" src="/img/blog/fig-group-grouplist.svg" />

A **Group List** is similar to the **Group** field type, with an added dimension. Whereas the Group field represents a single entity, the Group List represents _multiple entities_.

Let’s say, instead of a single name, we’re storing a list of names like this:

```json
{
  "subscribers": [
    {
      "first": "DJ",
      "last": "Walker"
    },
    {
      "first": "Nolan",
      "last": "Phillips"
    }
  ]
}
```

We could use a **Group List** here. All entities in the Group List have the same **shape**; in other words, each object in the array will have the same keys. This makes the Group List analogous to a two-dimensional data structure, like a spreadsheet or database table:

| **first** | **last** |
| --------- | -------- |
| DJ        | Walker   |
| Nolan     | Phillips |

## Blocks: Like a Group List, But Different

<Diagram alt="diagram of different shapes linked together" src="/img/blog/fig-blocks.svg" />

Like the **Group List**, the **Blocks** structure represents multiple entities. The difference between a Group List and Blocks is that the Blocks structure supports multiple entities _with potentially different shapes_. This makes the relationship between entities in a Blocks structure much looser than with a Group List.

### What are Blocks Useful For?

In practice, there are a couple use cases uniquely suited to Blocks.

The primary motivation for the Blocks-style data structure was to facilitate a page builder experience. In our [Tina Grande starter](https://github.com/tinacms/tina-starter-grande), a page can be strung together by adding different entities to a Blocks field, each one containing fields that configure a different part of the page.

Another way Grande makes use of Blocks is in its embedded form builder. Like the page builder, Grande approaches forms as a sequence of loosely-related, complex components (in this case, the form fields.)

## Give Blocks a Chance

By now, you should have a better sense of what we mean when we talk about Blocks in Tina.

If you want to see a glimpse of what you can do with a blocks-based content strategy, fork [Tina Grande](https://github.com/tinacms/tina-starter-grande) and give it a try.

If you still aren't quite sure how the Blocks field works, or want to share some ideas on using Blocks, swing by [our community forum](https://community.tinacms.org/) and make a post!
