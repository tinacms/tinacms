/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { defineSchema, TinaTemplate } from '@tinacms/cli'

const featureBlogList: TinaTemplate = {
  name: 'featuredBlogs',
  label: 'Featured Blogs',
  // ui: {
  //   defaultItem: {
  //     headline: 'ok',
  //   },
  // },
  fields: [
    {
      type: 'string',
      label: 'Headline',
      name: 'headline',
    },
    {
      label: 'Text',
      name: 'text',
      type: 'string',
    },
    {
      label: 'Blogs',
      name: 'blogs',
      type: 'object',
      list: true,
      ui: {
        defaultItem: {
          blog: 'content/post/default.md',
        },
      },
      fields: [
        {
          label: 'Blog',
          name: 'blog',
          type: 'reference',
          collections: ['post'],
        },
      ],
    },
  ],
}

export default defineSchema({
  collections: [
    {
      name: 'page',
      path: 'content/page',
      label: 'Page',
      format: 'mdx',
      fields: [
        {
          label: 'Blocks',
          name: 'blocks',
          type: 'object',
          list: true,
          templates: [featureBlogList],
        },
        // {
        //   name: 'body',
        //   label: 'Main Content',
        //   type: 'rich-text',
        //   isBody: true,
        // },
      ],
    },
    {
      name: 'author',
      path: 'content/authors',
      label: 'Author',
      format: 'md',
      fields: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'avatar',
          type: 'string',
        },
      ],
    },
    {
      label: 'Blog Posts',
      name: 'post',
      path: 'content/post',
      format: 'md',
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'string',
          label: 'Image',
          name: 'image',
        },
        {
          type: 'string',
          label: 'Topic',
          name: 'topic',
          options: ['programming', 'blacksmithing'],
          list: true,
        },
        {
          type: 'reference',
          label: 'Author',
          name: 'author',
          collections: ['author'],
        },
        {
          type: 'rich-text',
          label: 'Blog Post Body',
          name: 'body',
          isBody: true,
          templates: [
            {
              name: 'Gallery',
              label: 'Gallery',
              fields: [
                {
                  label: 'Images',
                  name: 'images',
                  type: 'object',
                  list: true,
                  fields: [
                    {
                      type: 'image',
                      name: 'src',
                      label: 'Source',
                    },
                    {
                      type: 'string',
                      name: 'width',
                      label: 'Width',
                    },
                    {
                      type: 'string',
                      name: 'height',
                      label: 'Height',
                    },
                  ],
                },
                {
                  type: 'string',
                  name: 'alignment',
                  label: 'Alignment',
                  options: ['left', 'center', 'right'],
                },
                {
                  type: 'string',
                  name: 'gap',
                  label: 'Gap',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
})
