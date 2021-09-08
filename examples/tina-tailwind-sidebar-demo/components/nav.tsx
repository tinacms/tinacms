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
import { Section } from './section'
import { Icon, ICON_FIELDS } from './icon'
import { BiSun } from 'react-icons/bi'
import { RiMoonClearLine } from 'react-icons/ri'
import { Homepage_Nav_Data, Maybe } from '../.tina/__generated__/types'

export const Nav = ({ nav }: { nav?: Maybe<Homepage_Nav_Data> }) => {
  const theme = React.useContext(ThemeContext)

  return (
    <Section>
      <div className="relative flex flex-col flex-wrap py-8 px-8 lg:px-12 2xl:px-16 mx-auto md:items-center md:flex-row">
        <a
          href="#"
          className="pr-2 lg:pr-8 mb-8 md:mb-0 focus:outline-none flex items-center"
        >
          <div className="inline-flex items-center">
            <div className={`mr-2`}>
              <Icon icon={nav?.wordmark?.icon || ''} />
            </div>
            <h2 className="font-bold tracking-tight transition duration-150 ease-out transform text-blueGray-500 dark:text-blueGray-200 lg:text-md text-bold">
              {nav?.wordmark?.name || ''}
            </h2>
          </div>
        </a>
        <div className="flex-grow md:flex md:justify-end">
          <nav className="flex flex-wrap items-center justify-between sm:justify-end text-base -mx-2 sm:-mx-6 md:mx-0">
            {nav?.items?.map(function (item, index) {
              return (
                <a
                  key={index}
                  href="#"
                  className={`mx-2 sm:mx-6 md:mx-8 text-sm tracking-wide font-semibold transition duration-150 ease-out text-gray-600 dark:text-gray-200`}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>
          <button
            onClick={() => {
              // @ts-ignore
              theme.toggleThemeMode()
            }}
            type="button"
            className="ml-8 outline-none opacity-30 hover:opacity-70 focus:opacity-100 focus:outline-none transparent absolute top-9 right-6  md:relative md:top-auto md:right-auto transition duration-150 ease-out"
            aria-pressed="false"
          >
            <BiSun
              className={`w-6 h-6 transition duration-300 ease-out transform ${
                // @ts-ignore
                theme.themeMode === 'light' && 'opacity-0 rotate-90'
              }`}
            />
            <RiMoonClearLine
              className={`w-6 h-6 absolute top-0 left-0 transition duration-300 ease-out transform  ${
                // @ts-ignore
                theme.themeMode === 'dark' && 'opacity-0 -rotate-90'
              }`}
            />
          </button>
        </div>
      </div>
    </Section>
  )
}

export const NAV_FIELDS = [
  {
    label: 'Wordmark',
    name: 'wordmark',
    component: 'group',
    fields: [
      ...ICON_FIELDS,
      {
        label: 'Name',
        name: 'name',
        component: 'text',
      },
    ],
  },
  {
    label: 'Nav Items',
    name: 'items',
    component: 'group-list',
    itemProps: (item) => ({
      label: item.label,
    }),
    defaultItem: () => ({
      label: 'Nav Link',
      link: '/',
    }),
    fields: [
      {
        label: 'Label',
        name: 'label',
        component: 'text',
      },
      {
        label: 'Link',
        name: 'link',
        component: 'text',
      },
    ],
  },
]
