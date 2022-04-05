---
title: Creating Field Plugins
date: '2020-02-17T07:00:00.000Z'
author: Kendall Strautman
draft: false
consumes:
  - file: /packages/next-tinacms-json/src/use-local-json-form.ts
    details: Example shows useLocalJsonForm in use
  - file: /packages/next-tinacms-json/src/use-json-form.ts
    details: Example shows useLocalJsonForm in use
  - file: /packages/@tinacms/form-builder/src/field-plugin.tsx
    details: Depends on the FieldPlugin interface
next: content/blog/gatsby-tina-101.md
prev: content/blog/custom-field-components.md
---

In the [previous post](https://tinacms.org/blog/custom-field-components), we learned how to create a custom field component and register it to the sidebar. With that baseline, let's go full circle on the topic of custom fields in TinaCMS. In this short but sweet post 🧁, we’ll cover how to _turn a field component into a field plugin._

## Field Plugin vs. Field Component

Plugins **extend functionality in the CMS**; field plugins allow us to create and register custom fields. _There are a few reasons why you may want to create a field plugin._ With a custom field, you can completely control the editing experience and functionality. If the primary fields provided by Tina don't fit your use case, **you can fill the gaps**.

A field component is just one piece of a field plugin ([more on this later](https://tinacms.org/blog/custom-field-plugins#field-plugin-interface)). A custom field component can achieve the same functionality as a plugin. But if you plan on reusing the custom field on different forms, it is recommended to take the extra steps to make a plugin 🔌.

Creating field plugins helps confine complex logic to a single module. This makes it easier to update or swap out custom field functionality later down the line. Using **the plugin API makes our 'higher-level' code more reusable** and contained, keeping the fields independent from the core CMS.

> For those who want to dig deeper, this approach seeks to embody the [Dependency Inversion Principle](https://stackify.com/dependency-inversion-principle/).

## Getting Started 👏

To follow along, you should have a custom field component set-up with a Tina form. If not, you can get some more context from the previous post: [how to create a custom field component](https://tinacms.org/blog/custom-field-components). In the following examples, I am using the same [llama-filters](https://github.com/kendallstrautman/llama-filters) 🦙 demo from our previous post.

There are **two steps to adding a field plugin to the CMS**. First, we'll define the field component object and register it with the CMS. Next, we'll use the field plugin in a form definition so we can edit content in the sidebar with our fancy custom field plugin.

> Want to see a _working example_? Check out the [Authors Field Plugin](https://github.com/tinacms/tina-starter-grande/blob/master/src/fields/authors.js) from the Tina Grande Starter.

### 1. Add the Field Plugin to the CMS

To register the custom field as a plugin with the CMS, we’ll need to head to the file where we can access the CMS instance. In the Next.js [demo](https://github.com/kendallstrautman/llama-filters/blob/master/pages/_app.js), we’ll look at `_app.js`.

```js
// _app.js

import React from 'react'
import App from 'next/app'
import { Tina, TinaCMS } from 'tinacms'
import { GitClient } from '@tinacms/git-client'
/*
 ** 1. Import the custom field component
 */
import RangeInput from '../components/RangeInput'

/*
 ** 2. Define the field plugin
 */
const customFieldPlugin = {
  name: 'range-input',
  Component: RangeInput,
}

export default class Site extends App {
  constructor() {
    super()
    this.cms = new TinaCMS({
      enabled: process.env.NODE_ENV !== 'production',
      apis: {
        git: new GitClient('/___tina'),
      },
      sidebar: {
        position: 'overlay',
      },
    })
    /*
     ** 3. Register the plugin with the cms
     */
    this.cms.fields.add(customFieldPlugin)
  }

  render() {
    //...
  }
}
```

You’ll want to import the custom field component and then register the plugin with the CMS directly. Notice how we import the `RangeInput` component created in the [previous post](https://tinacms.org/blog/custom-field-components). This is the custom _field component_ that we're now attaching to a _field plugin_.

> If you’re working with Gatsby, this [looks slightly different](/guides/gatsby/custom-email-field/register-field). _Hint_: you’ll head to the **gatsby-browser.js** file to access the CMS instance.

#### Field Plugin Interface

Let's break down the field plugin further. The interface below should provide some insight into all that can go into creating a field plugin. When you register a field plugin with Tina, it expects an object with a similar shape.

```ts
interface FieldPlugin {
  name: string
  Component: React.FC<any>
  type?: string
  validate?(
    value: any,
    allValues: any,
    meta: any,
    field: Field
  ): string | object | undefined
  parse?: (value: any, name: string, field: Field) => any
  format?: (value: any, name: string, field: Field) => any
  defaultValue?: any
}
```

At a minimum, field plugins **require a name and a component.** The `name` is used to reference the custom field in form definitions ([more on this later](https://tinacms.org/blog/custom-field-plugins#2-use-the-custom-field-in-a-form)). The `Component` is what is actually rendered in the sidebar.

You can see that there are additional configuration functions and options. _Note that the properties with a question mark are optional._ These options are incredibly useful for creating fields that require [validation](https://tinacms.org/docs/plugins/fields/custom-fields#validate-optional), parsing, or formatting.

> To see a more **complex example**, checkout the documentation on creating an [email field](/guides/gatsby/custom-email-field/register-field).

### 2. Use the custom field in a form

Now that the plugin is registered with the CMS, we can use it in any form definition. Going back to the [llama-filters demo](https://github.com/kendallstrautman/llama-filters), let’s head to `index.js` where the Tina form is configured. We need to **update the form options** for our image saturation field to reference the field plugin `name`, as opposed to calling the component directly.

```diff
/*
** 1. Remove the import of the custom field component
*/
- import RangeInput from '../components/RangeInput'
import React from 'react'
import { useLocalJsonForm } from 'next-tinacms-json'

export default function Index(props) {
  //...
}

const formOptions = {
 fields: [
   /*
   ** 2. Reference the field plugin `name` instead
   **    of passing the custom component directly
   */
   {
     label: 'Image Saturation',
     name: 'saturation',
-    component: RangeInput
+    component: 'range-input'
   }
 ]
}

Index.getInitialProps = async function() {
  //...
}
```

**That's it!** With the plugin defined and registered with the CMS, you can reuse this field _ad infinitum_. In my opinion, creating a field plugin helps maintain a consistent interface for defining forms. This way, the custom field works _behind the scenes_ as if it were a native Tina field, which is pretty slick.

## Short and sweet, as promised 🍰

This post, combined with the former, should give you all the building blocks to start making your own field plugins. Feel free to _dive into the documentation_ on [fields](https://tinacms.org/docs/plugins/fields/custom-fields/) or [plugins](https://tinacms.org/docs/cms#plugins). Make sure to share your groovy custom fields with us [@tina_cms](https://twitter.com/tina_cms) 🖖. Or, if you feel there is a fundamental field missing from Tina, [open up a PR](https://github.com/tinacms/tinacms/) to contribute your custom field!
