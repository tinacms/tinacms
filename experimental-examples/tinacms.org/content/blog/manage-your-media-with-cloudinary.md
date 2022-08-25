---
title: Manage your media with Cloudinary
date: '2021-07-09T08:34:47-04:00'
author: James Perkins
last_edited: '2021-07-09T13:35:07.608Z'
---

# Tina now supports Cloudinary as a Media Manager

We released our public alpha just over a month ago and one thing that has come up in the feedback we have been collecting is the ability to use Tina's Media Manager. This was a core feature that gives content creators the ability to drag and drop their images or replace an image easily. We decided to start with Cloudinary, to allow users to keep their GitHub repositories lightweight.

### Why did we start with Cloudinary?

Serving images for the web is not just about uploading one file in a specific format and resolution, it's way more complicated than that.
[Cloudinary](https://cloudinary.com/) has a powerful media API that returns optimized images. It can be used with [Next Image](https://nextjs.org/docs/api-reference/next/image) and Next image optimization, with minimal configuration.

### What formats are supported?

All image formats that are supported by Cloudinary are supported by Tina which are the following:

JPG, PNG, GIF, BMP, TIFF, ICO, PDF, EPS, PSD, SVG, WebP, JXR, and WDP.

### How to get started?

You need to install our new [Cloudinary package](https://www.npmjs.com/package/next-tinacms-cloudinary). This package handles adding, retrieving, updating and deleting images without the need for any additional code.

```other
yarn add next-tinacms-cloudinary
or
npm install next-tinacms-cloudinary
```

You also need to add your Cloudinary cloud name, API key and API secret from your Cloudinary account, to your `.env.local` file which you can find in your Cloudinary Dashboard.

```other
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

NEXT_PUBLIC_CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

### Adding Cloudinary to your application

Now that you have installed the Tina Cloudinary package, we need to make some changes to our Tina application to add support for images. Firstly you will need to update your Tina client to include the Cloudinary package:

```js
//Other imports

...
import { TinaCloudCloudinaryMediaStore } from 'next-tinacms-cloudinary'


....
const TinaWrapper = (props) => {
  const cms = React.useMemo(() => {
    return new TinaCMS({
      apis: {
        tina: client,
      },
      sidebar: {
        placeholder: SidebarPlaceholder,
      },
      enabled: true,
    })
  }, [])

  cms.media.store = new TinaCloudCloudinaryMediaStore(client)

  return (
    <TinaCloudAuthWall cms={cms}>
      <Inner {...props} />
    </TinaCloudAuthWall>
  )
}
....
// removed other code
```

Then we will need to update our schema to include the use of Images instead of a text field for a URL. Below contains an updated schema that would handle images, we have removed the other templates:

```js
import { defineSchema } from 'tina-graphql-gateway-cli'

export default defineSchema({
  collections: [
    {
      label: 'Blog Posts',
      name: 'post',
      path: 'content/posts',
      templates: [
        {
          label: 'Article',
          name: 'article',
          fields: [
            {
              type: 'text',
              label: 'Title',
              name: 'title',
            },
            {
              name: 'hero',
              type: 'image',
              label: 'Hero',
            },
            {
              type: 'reference',
              label: 'Author',
              name: 'author',
              collection: 'author',
            },
          ],
        },
      ],
    },
....
```

The last part of the Cloudinary integration is an API route that handles checking to see if the user is authorized to use the API route and then handle the correct api method.

```js
import {
  mediaHandlerConfig,
  createMediaHandler,
} from 'next-tinacms-cloudinary/dist/handlers'

import { isAuthorized } from 'tina-cloud-next'

export const config = mediaHandlerConfig

export default createMediaHandler({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  authorized: async (req, _res) => {
    try {
      const user = await isAuthorized(req)
      return user && user.verified
    } catch (e) {
      console.error(e)
      return false
    }
  },
})
```

Now when you launch your application you will see a change in the sidebar, that gives you access to the media manager:

![Tina Cloudinary Media manager](https://res.cloudinary.com/dub20ptvt/image/upload/v1625834243/Tina/AnimatedImage_z7kaub.gif)

Note that developers can [pass a `pageSize` option to the media store](https://github.com/tinacms/tina-graphql-gateway/blob/main/packages/next-tinacms-cloudinary/README.md) in order to decide how many media should be displayed per page in the manager. We'll continue improving Cloudinary integration and look into media caching later, for now, we feel it's already a huge step to make sure your content team can manage media like a pro in Tina.
