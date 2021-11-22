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
import { Section, SectionFields } from './section'
import { Testimonial_Data } from '../.tina/__generated__/types'

export const Testimonial = (props: Testimonial_Data) => {
  const theme = React.useContext(ThemeContext)

  return (
    <Section variant={props?.style?.color || 'blue'}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative">
          <blockquote>
            <div className="relative z-10 max-w-3xl mx-auto text-4xl lg:text-5xl font-extrabold tracking-normal text-center title-font text-white">
              <span
                className={`block opacity-20 text-black text-${theme.color}-700 text-8xl absolute inset-y-1/2 transform translate-y-2	-left-4 leading-4 -z-1`}
              >
                &ldquo;
              </span>
              <p className="relative opacity-95">{props.quote}</p>
              <span
                className={`block opacity-20 text-black text-${theme.color}-800 text-8xl absolute inset-y-1/2 transform translate-y-3	-right-4 leading-4 -z-1`}
              >
                &rdquo;
              </span>
            </div>
            <div className={`my-8 flex-grow-0`}>
              <span
                className={`block mx-auto h-0.5 w-1/6 bg-${theme.color}-300 dark:bg-${theme.color}-700 opacity-70`}
              ></span>
            </div>
            <footer className="text-center">
              <p
                className={`tracking-wide title-font font-bold text-base text-${theme.color}-500 dark:text-${theme.color}-300`}
              >
                {props.author}
              </p>
            </footer>
          </blockquote>
        </div>
      </div>
    </Section>
  )
}

export const testimonial_template = {
  label: 'Testimonial',
  defaultItem: {
    quote:
      'There are only two hard things in Computer Science: cache invalidation and naming things.',
    author: 'Phil Karlton',
    style: {
      color: 'primary',
    },
  },
  fields: [
    {
      name: 'quote',
      label: 'Quote',
      component: 'textarea',
    },
    {
      name: 'author',
      label: 'Author',
      component: 'text',
    },
    {
      name: 'style',
      label: 'Style',
      component: 'group',
      fields: [...SectionFields],
    },
  ],
}
