---
title: Introducing the TinaCMS Media Manager
date: '2020-10-02T10:20:39-04:00'
author: Kendall Strautman
last_edited: '2020-10-05T01:23:41.347Z'
---

Websites today contain more dog GIFs and landscape hero photos than ever. Content editors need a way to work with that media when creating and updating web pages, blogs, or articles.

Up until now, media changes with Tina have been handled through image fields. By clicking on the field, editors could upload new images from their local filesystem. Developers would register a [Media Store](/docs/media/#media-store) to the CMS that would handle uploading files. However, there was no way to view images that had already been uploaded to use them in a piece of content.

Our latest release has addressed this limitation, and added a **Media Management Interface!**

![media-manager-image](/img/media-manager-ui.png)

Over [the last several weeks](https://github.com/tinacms/tinacms/blob/master/ROADMAP.md#process), the Tina team has been focused on improving media management. This media manager allows editors to upload, delete, and browse media files and directories. File upload can occur via drag and drop directly onto the media list or by clicking the **Upload** button.

Along the way, we've made some significant changes to the media and image field APIs to improve the overall experience of working with media. This post outlines all of the new features and breaking changes.

## Features & Improvements

### Adding a media store

Now that the interface for using media with the CMS is better understood, we've decided to streamline the API for adding a media store to the CMS. Where media stores were previously registered to `cms.media.store` in the CMS config, they should now just be registered to `cms.media`.

**Before**

```tsx
new TinaCMS({
  media: {
    store: new MyMediaStore(),
  },
})
```

**After**

```tsx
new TinaCMS({
  media: new MyMediaStore(),
})
```

### Media Object

3 new attributes were added to the individual [`Media` object interface](/docs/media/#media).

- `type` : Denotes whether the media item is a [file or a directory](https://github.com/tinacms/tinacms/issues/1452).
- `id`: A unique identifier for this file, typically the full path to the file.
- `previewSrc`: A URL to source a preview image. This attribute is optional, but should be included in the return values of a media store's `list` function in order to display preview images in the media listing.

### Media Store

Two new methods were added to the [Media Store](/docs/media/#media-store) interface.

- `list`: This function provides a paginated list of available items for the media manager to render.
- `delete`: This function deletes a media file.

These methods are **required** in order to satisfy the `MediaStore` interface. All media stores available in `tinacms` have been updated to support these methods, but if you have created a custom store, you will need to implement these yourself when updating.

### Events

We added many [new events](https://github.com/tinacms/tinacms/pull/1474) to mark the asynchronous methods used for media management. Use these media events to track media changes or states within your CMS and trigger feedback to the user.

- `media:upload:start`
- `media:upload:success`
- `media:upload:failure`
- `media:list:start`
- `media:list:success`
- `media:list:failure`
- `media:delete:start`
- `media:delete:success`
- `media:delete:failure`
- `media:previewSrc:start`
- `media:previewSrc:success`
- `media:previewSrc:failure`

### Image Fields

Both the inline and regular image fields were updated to work with the new media manager.

**Changes for both fields**:

When you click either type of image field, this action will open the media manager interface, instead of opening the local file picker. You can upload a new image or insert a previously added image into the field.

Another change for both fields is that the `uploadDir` function is [now optional](https://github.com/tinacms/tinacms/pull/1485). When set, the media manager will open and list items from that directory when clicking the field.

**Specific inline image additions:**

For the inline image field, we added a new `alt` attribute. This attribute is helpful when using `InlineImage` without the render props pattern so that you can set the alternative text directly on the image element rendered by `InlineImage`.

Another improvement is the ability to [extend styles](/docs/ui/inline-editing/#extending-inline-field-styles) on the inline image. The inline image field adds a few elements to the DOM, which could throw off styles for some layouts. Styles can now be set directly via `className` or through [styled-components](https://styled-components.com/docs/basics#extending-styles).

```tsx
/**
* Style via className------------------------------------
*/
<InlineImage
  name="frontmatter.image.src"
  uploadDir={() => '/public/images/'}
  parse={media => media.id}
  alt={data.frontmatter.image.alt}
  className="inline-img"
/>

// Example CSS
.inline-img {
  background-color: pink;
}

/**
* Style via styled-components ----------------------------
*/
<StyledInlineImage
  name="frontmatter.image.src"
  uploadDir={() => '/public/images/'}
  parse={media => media.id}
  alt={data.frontmatter.image.alt}
/>

const StyledInlineImage = styled(InlineImage)`
  background-color: pink;
`
```

## Breaking Changes

We don't take the introduction of breaking changes lightly. We believe many of these changes are obvious API improvements, and that the new media management UI is worth the cost of upgrading.

The breaking changes are mostly related to both inline and regular image field configuration. Use the below notes as a migration guide to upgrade your projects to the latest release:

### _previewSrc_

The `previewSrc` function provides a URL for the image source when the CMS is enabled. This function is implemented by the [media store default](https://github.com/tinacms/tinacms/pull/1386) or can be overridden on a field-by-field basis.

We unified the `previewSrc` interface between [`MediaStore`](/docs/media#media-store), [`InlineImage`](/docs/ui/inline-editing/inline-image/), and the regular [image field](/docs/plugins/fields/images).

The breaking change is that the additional arguments are now passed to `previewSrc`. We made this change because we found ourselves often returning the field value when configuring this function in image fields. Instead of having to wade through all of the form values when providing a `previewSrc`, the first argument alone should be adequate for most use-cases.

**Before**

```tsx
// Example image field config
{
  name: "coverPhoto",
  component: "image",
  previewSrc(formValues, { input }) {
    const fieldValue = input.value
    const fieldPath = input.name
    //...
  }
}
```

**After**

```tsx
{
  name: "coverPhoto",
  component: "image",
  previewSrc(src, fieldPath, formValues) {
    //...
  }
}
```

Media stores can implement a catch-all `previewSrc` method that will be run if a field does not define its own `previewSrc`. If you're using a media store provided by a Tina package, or using one that otherwise defines a `previewSrc`, you can probably remove your field's custom `previewSrc` method entirely.

### _parse_

The argument passed to the `parse` function on both the inline and regular image fields was altered to provide more flexibility in configuring how image paths are saved in the data source. `parse` handles how the final value in the data source is populated.

Instead of passing the `filename`, the entire [media object](/docs/media#media) is now passed. As a general recommendation, you could use either `media.id`(the full path to the image) or `media.filename` to adjust the preferred final value saved in the data source.

**Before**

```tsx
parse: filename => `/images/${filename}`
```

**After**

```tsx
parse: media => `/images/${media.filename}`
```

### _InlineImage_ render child props

When using the [render props pattern](https://reactjs.org/docs/render-props.html) to configure an inline image field, there was some inconsistency with the props the render child received depending on whether the CMS was enabled. This forced developers to provide a backup source and account for whether props were being passed at all.

With this new API, the render child is always passed a `src`, and the field handles whether `src` should be the return value from the `previewSrc` function (when the CMS is enabled), or the value in the data source.

> Note that if you're using [gatsby-image](https://www.gatsbyjs.com/plugins/gatsby-image/), you'll still need to provide a backup `src` value as the path to the image is _transformed_ and does not reflect the value in the data source.

**Before**

```tsx
<InlineImage
  name="hero_image"
  uploadDir={() => '/public/images/'}
  parse={media => media.id}
>
  {props => <img src={props?.previewSrc || data.hero_image} />}
</InlineImage>
```

**After**

```tsx
<InlineImage
  name="hero_image"
  uploadDir={() => '/public/images/'}
  parse={media => media.id}
>
  {props => <img src={props.src} />}
</InlineImage>
```

## What's Next?

### Wysiwyg Images

For the rest of the cycle, we will focus on improving the previously mentioned changes and refactoring the WYSIWYG to connect with the media manager. Expect some additional breaking changes to align the WYSIWYG image implementation with the Media Store and other image fields.

### Extending Media Stores

While making all these changes, we also revisited the previous media stores for updates and became fond of this pattern of extending existing media stores. This pattern allows us to customize certain methods to a particular framework or site structure.

Check out the [`NextGithubMediaStore`](https://github.com/tinacms/tinacms/blob/master/packages/next-tinacms-github/src/next-github-media-store.ts), the [PlaceCage media store](https://github.com/ncphillips/tinacms-placecage), or the [Cloudinary media store](https://github.com/tinalabs/media-manager-prototype/blob/8f766ff7d421a9f6dd8fb8ea40d2f08da9537de3/pages/gh/posts/%5Bslug%5D.tsx#L28-L81) prototypes for some inspiration on creating or extending your own media stores. And stay tuned for follow-up thoughts on this pattern in an upcoming blog post!

Hopefully, this post arms you with all the information needed to upgrade your Tina packages and start playing with the media manager. As usual, we'd love feedback and ideas in the [forum](https://community.tinacms.org/) or [bug reports](https://github.com/tinacms/tinacms/issues) on the repository. Thanks and happy media managing 🦙 🌅!
