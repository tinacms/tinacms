---
title: Image Field
prev: /docs/reference/toolkit/fields/number
next: /docs/reference/toolkit/fields/color
consumes:
  - file: /packages/tinacms/src/plugins/fields/ImageFieldPlugin.tsx
    details: Shows image field interface and how to use
  - file: /packages/@tinacms/fields/src/ImageUpload/ImageUpload.tsx
    details: References the image field and upload config
---

{{ WarningCallout text="This is an advanced-use feature, and likely not something you'll need to configure. What you probably want is the [content types reference](/docs/reference/types/)" }}

The `image` field is used for content values that point to an image used on the page. This field allows you to upload new images by via dragging or selection in Finder. Note this field does not handle any images included in the Markdown body, those would be handled by the [markdown](/docs/reference/toolkit/fields/markdown) component.

![tinacms-image-field](/img/fields/image.png)

## Definition

```typescript
interface ImageConfig {
  component: 'image'
  name: string
  label?: string
  description?: string
  clearable?: boolean
  parse(media: Media): string
  previewSrc(formValues: any)?: string
  uploadDir(formValues: any)?: string
}
```

---

| Key           | Description                                                                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `component`   | The name of the plugin component. Always `'image'`.                                                                                                                                                                      |
| `name`        | The path to some value in the data being edited.                                                                                                                                                                         |
| `label`       | A human readable label for the field. Defaults to the `name`. _(Optional)_                                                                                                                                               |
| `description` | Description that expands on the purpose of the field or prompts a specific action. _(Optional)_                                                                                                                          |
| `clearable`   | When true, editors can 'clear' the image field to an empty state via a trash icon. _(Optional)_                                                                                                                          |
| `parse`       | Defines how the actual front matter or data value gets populated. The media object gets passed as an argument, and one can set the path this image as defined by the uploadDir property.                                 |
| `previewSrc`  | Defines the path for the src attribute on the image preview. If using gatsby-image, the path to the `childImageSharp.fluid.src` needs to be provided. \_(Optional)                                                       |
| `uploadDir`   | Defines the upload directory for the image. All of the form data is passed in, `fileRelativePath` is most useful in defining the upload directory, but you can also statically define the upload directory. \_(Optional) |

---

> This interfaces only shows the keys unique to the image field.
>
> Visit the [Field Config](/docs/reference/toolkit/fields) docs for a complete list of options.

## Examples

**Next.js**

Below is an example of an `image` field defined in a Next.js project.

```jsx
const formOptions = {
  fields: [
    {
      label: 'Hero Image',
      name: 'frontmatter.hero_image',
      component: 'image',
      // Generate the frontmatter value based on the filename
      parse: media => `/static/${media.filename}`,

      // Decide the file upload directory for the post
      uploadDir: () => '/public/static/',

      // Generate the src attribute for the preview image.
      previewSrc: fullSrc => fullSrc.replace('/public', ''),
    },
  ],
  //...
}
```

**Gatsby**

Below is an example of how a `image` field could be defined in a Gatsby Remark form.

```javascript
const BlogPostForm = {
  fields: [
    {
      label: 'Hero Image',
      name: 'rawFrontmatter.hero.image',
      component: 'image',
      parse: media => {
        if (!media) return ''
        return `../images/${media.filename}`
      },
      uploadDir: () => `/content/images/`,
      previewSrc: (src, path, formValues) => {
        if (!formValues.frontmatter.hero || !formValues.frontmatter.hero.image)
          return ''

        return formValues.frontmatter.hero.image.childImageSharp.fluid.src
      },
    },
    // ...
  ],
}
```

### Proper Image Paths in Gatsby

In order for image paths to be properly sourced into GraphQL, it's best if a _relative path_ to the image is saved to the content file's front matter. Constructing this relative path will depend on where the image is uploaded to as well as the location of the content file. The following example uses a co-location strategy, where a blog post is stored in `content/blog/$slug/index.md` and its images will be uploaded to `content/blog/$slug/$image.png`:

```javascript
import get from 'lodash.get'
const path = require('path').posix

const BlogPostForm = {
  fields: [
    {
      name: 'rawFrontmatter.thumbnail',
      label: 'Thumbnail',
      component: 'image',
      previewSrc: (src, path, formValues) => {
        if (!formValues.frontmatter.thumbnail) return ''

        return formValues.frontmatter.thumbnail.childImageSharp.fluid.src
      },

      // upload images to same directory as content file
      uploadDir: formValues => path.dirname(formValues.fileRelativePath),

      // image file is sibling of content file
      parse: filename => `./${filename}`,
    },
    // ...
  ],
}
```
