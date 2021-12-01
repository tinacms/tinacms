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

const chroma = require('chroma-js')
const colors = require('tailwindcss/colors')

module.exports = {
  purge: [],
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.coolGray,
      blue: colors.blue,
      teal: colors.cyan,
      green: colors.emerald,
      red: colors.rose,
      purple: colors.purple,
      pink: colors.pink,
      yellow: colors.yellow,
      orange: colors.orange,
    },
    screens: {
      sm: '600px',
      md: '900px',
      lg: '1200px',
      xl: '1500px',
      '2xl': '1800px',
    },
    extend: {
      spacing: {
        128: '32rem',
      },
      zIndex: {
        '-1': '-1',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    /* https://gist.github.com/Merott/d2a19b32db07565e94f10d13d11a8574 */
    function ({ addBase, theme }) {
      function extractColorVars(colorObj, colorGroup = '') {
        return Object.keys(colorObj).reduce((vars, colorKey) => {
          const value = colorObj[colorKey]

          if (value === 'transparent' || value === 'currentColor') return

          const newVars =
            typeof value === 'string'
              ? {
                  [`--color${colorGroup}-${colorKey}`]: value,
                  [`--color-rgb${colorGroup}-${colorKey}`]: chroma(value)
                    .rgb()
                    .toString(),
                }
              : extractColorVars(value, `-${colorKey}`)

          return { ...vars, ...newVars }
        }, {})
      }

      addBase({
        ':root': extractColorVars(theme('colors')),
      })
    },
  ],
}
