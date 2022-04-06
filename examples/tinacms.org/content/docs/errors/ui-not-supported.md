---
title: 'WARNING: The user interface for {type} does not support `list: true`'
last_edited: '2021-09-17T14:50:37.760Z'
---

We have expanded the graphql API capabilities to to have a [`list` property](/docs/schema/#the-list-property) option for every field. This means that the graphql response will return a array for of [`type`](/docs/schema/#the-type-property) for this field. This is support on our backend but we still have not implanted the front end user interface for these fields yet. [Here is the relevant issue for tracking](https://github.com/tinacms/tinacms/issues/2081). There are currently two workarounds for this issue.

## 1. Wrap in object field

Wrap in an [`object` field](/docs/schema/#the-object-property). If your field looked like this

```js
{
    type: "image",
    name: "images",
    label: "Images",
    list: true,
}
```

This can be used instead

```js
{
    type: "object",
    name: "images",
    label: "Images",
    list: true,
    fields: [
        {
            type: "image",
            name: "image",
            label: "A single image",
        }
    ]
}
```

Now you will be able to and delete new images in a list.

## 2. Create your own custom UI

You can create your own custom user interface by adding a [custom field](/docs/advanced/extending-field-plugin/). You will have to make your own component that follows that type in the schema. After that is done your field could look like this.

```js
{
    type: "image",
    name: "images",
    label: "Images",
    list: true,
    ui: {
        component: "MyCustomImageListingField",
    }
}
```
