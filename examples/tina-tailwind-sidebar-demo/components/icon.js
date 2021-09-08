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
import {
  BiCodeBlock,
  BiLike,
  BiMapAlt,
  BiPalette,
  BiPieChartAlt2,
  BiPin,
  BiShield,
  BiSlider,
  BiStore,
  BiTennisBall,
  BiTestTube,
  BiTrophy,
  BiUserCircle,
  BiBeer,
  BiChat,
  BiCloud,
  BiCoffeeTogo,
  BiWorld,
} from 'react-icons/bi'
import { FiAperture } from 'react-icons/fi'

const iconOptions = {
  BiCodeBlock: BiCodeBlock,
  BiLike: BiLike,
  BiMapAlt: BiMapAlt,
  BiPalette: BiPalette,
  BiPieChartAlt2: BiPieChartAlt2,
  BiPin: BiPin,
  BiShield: BiShield,
  BiSlider: BiSlider,
  BiStore: BiStore,
  BiTennisBall: BiTennisBall,
  BiTestTube: BiTestTube,
  BiTrophy: BiTrophy,
  BiUserCircle: BiUserCircle,
  BiBeer: BiBeer,
  BiChat: BiChat,
  BiCloud: BiCloud,
  BiCoffeeTogo: BiCoffeeTogo,
  BiWorld: BiWorld,
  FiAperture: FiAperture,
}

export const Icon = ({ icon }) => {
  const theme = React.useContext(ThemeContext)
  const iconSize = icon?.size ? (icon.size === 'large' ? 14 : 9) : 14

  const IconSVG = React.useMemo(() => {
    return icon?.name ? iconOptions[icon?.name] : randomProperty(iconOptions)
  }, [icon?.name])

  const Component = React.useMemo(() => {
    const iconColor =
      icon?.color === 'primary' ? theme.color : icon?.color || 'blue'

    if (!IconSVG) return null
    if (icon?.style == 'circle') {
      return (
        <div
          className={`relative z-10 inline-flex items-center justify-center flex-shrink-0 w-${iconSize} h-${iconSize} bg-${iconColor}-400 dark:bg-${iconColor}-500 text-${iconColor}-50 rounded-full`}
          style={{
            textShadow: '0 2px 5px rgba(0,0,0,0.1)',
            boxShadow: `0 0.5rem 3rem 0px rgba(var(--color-rgb-${iconColor}-600),0.35)`,
          }}
        >
          <IconSVG
            className={`w-${Math.max(iconSize - 5, 6)} h-${Math.max(
              iconSize - 5,
              6
            )}`}
          />
        </div>
      )
    } else {
      return (
        <IconSVG
          className={`w-${iconSize} h-${iconSize} text-${iconColor}-400 dark:text-${iconColor}-500`}
          style={{
            filter: `drop-shadow(0 0.5rem 1rem rgba(var(--color-rgb-${iconColor}-600),0.4))`,
          }}
        />
      )
    }
  }, [icon?.style, IconSVG, icon?.color, theme.color])

  return Component
}

export const ICON_FIELDS = [
  {
    label: 'Icon',
    name: 'icon',
    component: 'group',
    fields: [
      {
        name: 'color',
        label: 'Color',
        component: 'select',
        options: [
          {
            label: 'Primary (Theme)',
            value: 'primary',
          },
          {
            label: 'Blue',
            value: 'blue',
          },
          {
            label: 'Teal',
            value: 'teal',
          },
          {
            label: 'Green',
            value: 'green',
          },
          {
            label: 'Red',
            value: 'red',
          },
          {
            label: 'Pink',
            value: 'pink',
          },
          {
            label: 'Purple',
            value: 'purple',
          },
          {
            label: 'Orange',
            value: 'orange',
          },
          {
            label: 'Yellow',
            value: 'yellow',
          },
        ],
      },
      {
        name: 'name',
        label: 'Icon',
        component: 'select',
        options: [
          {
            label: 'Random',
            value: '',
          },
          {
            label: 'Aperture',
            value: 'FiAperture',
          },
          {
            label: 'Code Block',
            value: 'BiCodeBlock',
          },
          {
            label: 'Like',
            value: 'BiLike',
          },
          {
            label: 'Map',
            value: 'BiMapAlt',
          },
          {
            label: 'Palette',
            value: 'BiPalette',
          },
          {
            label: 'Pie Chart',
            value: 'BiPieChartAlt2',
          },
          {
            label: 'Pin',
            value: 'BiPin',
          },
          {
            label: 'Shield',
            value: 'BiShield',
          },
          {
            label: 'Setting Sliders',
            value: 'BiSlider',
          },
          {
            label: 'Store',
            value: 'BiStore',
          },
          {
            label: 'Tennis Ball',
            value: 'BiTennisBall',
          },
          {
            label: 'Test Tube',
            value: 'BiTestTube',
          },
          {
            label: 'Trophy',
            value: 'BiTrophy',
          },
          {
            label: 'User',
            value: 'BiUserCircle',
          },
          {
            label: 'Beer',
            value: 'BiBeer',
          },
          {
            label: 'Chat',
            value: 'BiChat',
          },
          {
            label: 'Cloud',
            value: 'BiCloud',
          },
          {
            label: 'Coffee',
            value: 'BiCoffeeTogo',
          },
          {
            label: 'World',
            value: 'BiWorld',
          },
        ],
      },
      {
        name: 'style',
        label: 'Style',
        component: 'radio-group',
        variant: 'button',
        options: [
          {
            label: 'Circle',
            value: 'circle',
          },
          {
            label: 'Float',
            value: 'float',
          },
        ],
      },
    ],
  },
]

const randomProperty = (obj) => {
  var keys = Object.keys(obj)
  return obj[keys[(keys.length * Math.random()) << 0]]
}
