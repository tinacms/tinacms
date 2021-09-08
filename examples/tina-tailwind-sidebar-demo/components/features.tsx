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

import { Icon, ICON_FIELDS } from './icon'
import { Actions, ACTION_FIELDS } from './actions'
import { Section, SectionFields } from './section'
import {
  Features_Data,
  Features_Items_Data,
} from '../.tina/__generated__/types'

export const Feature = (data: Features_Items_Data) => {
  return (
    <div
      className="px-8 py-6 w-full xl:w-auto flex-grow xl:flex-shrink"
      style={{ flexBasis: '22rem' }}
    >
      <div className="max-w-lg">
        <div className={`mb-6 w-auto inline-block`}>
          <Icon icon={data?.icon} />
        </div>
        <h3 className="mb-4 transition duration-150 ease-out text-2xl font-semibold title-font">
          {data?.title}
        </h3>
        <p className="mb-5 transition duration-150 ease-out text-base opacity-80 leading-relaxed">
          {data?.text}
        </p>
        <Actions actions={data?.actions} />
      </div>
    </div>
  )
}

export const Features = (props: Features_Data) => {
  return (
    <Section variant={props?.style?.color || 'blue'}>
      <div className="container py-12 lg:py-24 mx-auto">
        <div className="flex flex-wrap text-left">
          {props.items?.map((item, i) => {
            return <Feature key={i} {...item} />
          })}
        </div>
      </div>
    </Section>
  )
}

export const features_template = {
  label: 'Features',
  defaultItem: {
    items: [
      {
        _template: 'feature',
        icon: {
          color: 'red',
          name: 'BiTrophy',
          style: 'circle',
        },
        title: 'Longer Information 1',
        text: "By eleven o'clock the next day we were well upon our way to the old English capital.",
        actions: [
          {
            label: 'Learn More',
            type: 'link',
            icon: 'true',
          },
        ],
      },
      {
        _template: 'feature',
        icon: {
          color: 'primary',
          name: 'BiPieChartAlt2',
          style: 'circle',
        },
        title: 'Longer Information 2',
        text: 'Connect to any data source, edit with Tina. Designed for the Jamstack with a focus on React-based sites. ',
        actions: [
          {
            label: 'Learn More',
            type: 'link',
            icon: 'true',
          },
        ],
      },
      {
        _template: 'feature',
        icon: {
          color: 'yellow',
          name: 'BiMapAlt',
          style: 'circle',
        },
        title: 'Longer Information 3',
        text: 'Connect to any data source, edit with Tina. Designed for the Jamstack with a focus on React-based sites. ',
        actions: [
          {
            label: 'Learn More',
            type: 'link',
            icon: 'true',
          },
        ],
      },
    ],
    style: {
      color: 'default',
    },
  },
  fields: [
    {
      label: 'Features',
      name: 'items',
      component: 'group-list',
      defaultItem: {
        icon: {
          color: 'primary',
          name: '',
          style: 'circle',
        },
        title: 'Feature Heading Text',
        text: 'Connect to any data source, edit with Tina. Designed for the Jamstack with a focus on React-based sites. ',
        actions: [
          {
            label: 'Learn More',
            type: 'link',
            icon: 'true',
          },
        ],
        style: {
          color: 'default',
        },
      },
      itemProps: (item) => ({
        label: item.title,
      }),
      fields: [
        ...ICON_FIELDS,
        {
          name: 'title',
          label: 'Title',
          component: 'text',
        },
        {
          name: 'text',
          label: 'Text',
          component: 'text',
        },
        ...ACTION_FIELDS,
      ],
    },
    {
      name: 'style',
      label: 'Style',
      component: 'group',
      fields: [...SectionFields],
    },
  ],
}

const FEATURE_BLOCKS = {
  feature: Feature,
}
