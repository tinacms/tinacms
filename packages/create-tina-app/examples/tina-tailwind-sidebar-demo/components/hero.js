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

import * as React from 'react'
import { ThemeContext } from './theme'
import { ACTION_FIELDS, Actions } from './actions'
import { Section, SectionFields } from './section'

export const Hero = (data) => {
  const theme = React.useContext(ThemeContext)

  return (
    <Section variant={data?.style?.color || 'blue'}>
      <div className="w-full pt-20 lg:py-56 lg:text-left">
        <div className="px-8 pb-20 lg:pb-0 lg:w-1/2 lg:px-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="w-full	mb-5 text-md font-bold tracking-wide title-font">
              {data.tagline}
            </h2>
            <h3
              className={`w-full relative	mb-6 text-5xl font-extrabold tracking-normal text-left title-font`}
            >
              {data.style?.color === 'primary' ? (
                <span
                  className={`bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-gray-800`}
                  style={{
                    textShadow: `0 0.5rem 3rem rgba(var(--color-rgb-${theme.color}-600),0.35)`,
                    boxDecorationBreak: 'clone',
                    WebkitBoxDecorationBreak: 'clone',
                  }}
                >
                  {data.headline}
                </span>
              ) : (
                <span
                  className={`bg-clip-text text-transparent bg-gradient-to-r from-${theme.color}-400 to-${theme.color}-600`}
                  style={{
                    textShadow: `0 0.5rem 3rem rgba(var(--color-rgb-${theme.color}-600),0.35)`,
                    boxDecorationBreak: 'clone',
                    WebkitBoxDecorationBreak: 'clone',
                  }}
                >
                  {data.headline}
                </span>
              )}
            </h3>
            <p className="w-full max-w-xl mb-8 opacity-80 transition duration-150 ease-out text-left text-lg leading-relaxed lg:text-xl lg:leading-relaxed">
              {data.paragraph}
            </p>
            <Actions actions={data.actions} />
          </div>
        </div>
        <div className="relative w-full h-auto lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:h-full">
          {data?.image && (
            <img
              className="lg:absolute lg:inset-0 w-full h-auto max-h-96 md:max-h-128 lg:max-h-full lg:h-full object-cover"
              alt={data.image.alt}
              src={data.image.src}
            />
          )}
        </div>
      </div>
    </Section>
  )
}

export const IMAGE_FIELDS = [
  {
    name: 'src',
    label: 'Image Source',
    component: 'text',
  },
  {
    name: 'alt',
    label: 'Alt Text',
    component: 'text',
  },
]

export const hero_template = {
  label: 'Hero',
  defaultItem: {
    tagline: 'TAGLINE ABOVE TEXT',
    headline: 'This is a large display heading.',
    text: 'Give your team a contextual, intuitive editing experience without sacrificing code quality.',
    image: {
      src: '/canal.jpg',
      alt: 'Photo from Unsplash',
    },
    actions: [
      {
        label: 'Primary Action',
        type: 'button',
        icon: 'true',
      },
      {
        label: 'Learn More',
        type: 'link',
      },
    ],
    style: {
      color: 'tint',
    },
  },
  fields: [
    {
      name: '',
      label: 'Text',
      component: 'group',
      fields: [...SectionFields],
    },
    {
      name: 'image',
      label: 'Image',
      component: 'group',
      fields: IMAGE_FIELDS,
    },
    ...ACTION_FIELDS,
    {
      name: 'style',
      label: 'Style',
      component: 'group',
      fields: [
        {
          name: 'color',
          label: 'Color',
          component: 'select',
          options: [
            {
              label: 'Default',
              value: 'default',
            },
            {
              label: 'Tint',
              value: 'tint',
            },
            {
              label: 'Primary',
              value: 'primary',
            },
          ],
        },
      ],
    },
  ],
}
