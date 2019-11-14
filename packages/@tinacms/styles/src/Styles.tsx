/**

Copyright 2019 Forestry.io Inc


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

import styled, { createGlobalStyle, css } from 'styled-components'

export interface ThemeProps {
  theme: {
    tinacms?: Theme
  }
}

export interface Theme {
  color: {
    primary: {
      light: string
      medium: string
      dark: string
    }
    error: {
      light: string
      medium: string
      dark: string
    }
    grey: {
      0: string
      1: string
      2: string
      3: string
      4: string
      5: string
      6: string
      7: string
      8: string
      9: string
    }
  }
  radius: {
    small: string
    big: string
  }
  padding: {
    small: string
    big: string
  }
  font: {
    size: {
      0: string
      1: string
      2: string
      3: string
      4: string
      5: string
      6: string
    }
    weight: {
      regular: number
      bold: number
    }
  }
  shadow: {
    small: string
    big: string
  }
  timing: {
    short: string
    medium: string
    long: string
  }
}

export const DefaultTheme: Theme = {
  color: {
    primary: {
      light: '#2296FE',
      medium: '#0084ff',
      dark: '#0574E4',
    },
    error: {
      light: '#EB6337',
      medium: '#EC4815',
      dark: '#DC4419',
    },
    grey: {
      0: '#FFFFFF',
      1: '#F6F6F9',
      2: '#EDECF3',
      3: '#E1DDEC',
      4: '#B2ADBE',
      5: '#918C9E',
      6: '#716C7F',
      7: '#565165',
      8: '#433E52',
      9: '#363145',
    },
  },
  radius: {
    small: '0.3rem',
    big: '1.5rem',
  },
  padding: {
    small: '0.75rem',
    big: '1.25rem',
  },
  font: {
    size: {
      0: '0.6875rem', // 11px
      1: '0.8125rem', // 13px
      2: '0.9375rem', // 15px
      3: '1rem', // 16px
      4: '1.125rem', // 18px
      5: '1.25rem', // 20px
      6: '1.375rem', // 22px
    },
    weight: {
      regular: 500,
      bold: 600,
    },
  },
  shadow: {
    small: '0px 2px 3px rgba(0, 0, 0, 0.12)',
    big: '0px 2px 3px rgba(0, 0, 0, 0.12), 0px 4px 8px rgba(48, 48, 48, 0.1)',
  },
  timing: {
    short: '85ms',
    medium: '150ms',
    long: '250ms',
  },
}

/* Color Helpers */
const tinacms = (props: ThemeProps): Theme => {
  const tina = props.theme.tinacms
  return tina || DefaultTheme
}

function primary(value: keyof Theme['color']['primary'] = 'medium') {
  return (props: ThemeProps) => tinacms(props).color['primary'][value]
}

function grey(value: keyof Theme['color']['grey'] = 0) {
  return (props: ThemeProps) => tinacms(props).color['grey'][value]
}

function error(value: keyof Theme['color']['error'] = 'medium') {
  return (props: ThemeProps) => tinacms(props).color['error'][value]
}

export const color = {
  primary: primary,
  grey: grey,
  error: error,
}

/* Font Helpers */

function size(value: keyof Theme['font']['size'] = 0) {
  return (props: ThemeProps) => tinacms(props).font.size[value]
}

function weight(value: keyof Theme['font']['weight'] = 'regular') {
  return (props: ThemeProps) => tinacms(props).font.weight[value]
}

export const font = {
  size: size,
  weight: weight,
}

/* Other Helpers */

export const radius = function(size: keyof Theme['radius'] = 'big') {
  return (props: ThemeProps) => tinacms(props).radius[size]
}

export const padding = function(size: keyof Theme['padding'] = 'big') {
  return (props: ThemeProps) => tinacms(props).padding[size]
}

export const shadow = function(size: keyof Theme['shadow'] = 'big') {
  return (props: ThemeProps) => tinacms(props).shadow[size]
}

export const timing = function(length: keyof Theme['timing']) {
  return (props: ThemeProps) => tinacms(props).timing[length]
}

export const GlobalStyles = createGlobalStyle`
  @import url('https://rsms.me/inter/inter.css');
  html {
    font-family: 'Inter', sans-serif;
    font-size: 100%;
    -webkit-text-size-adjust: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  body {
    margin: 0;
    padding: 0;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
  hr {
    border-color: #EDECF3;
    color: #EDECF3;
    margin-bottom: 1.5rem;
    margin-left: -1.25rem;
    margin-right: -1.25rem;
    border-top: 1px solid #EDECF3;
    border-bottom: none;
    height: 0;
    box-sizing: content-box;
  }
  h1, h2, h3, h4, h5, h6, p {
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
`

export const TinaResetStyles = css`
  -webkit-font-smoothing: antialiased;
  -webkit-text-size-adjust: 100%;
  backface-visibility: visible;
  background-color: transparent;
  background-image: none;
  border-color: transparent;
  border-image: initial;
  border-radius: 0px;
  border-style: none;
  border-width: 0px;
  bottom: auto;
  box-shadow: none;
  box-sizing: border-box;
  box-sizing: content-box;
  caption-side: top;
  clear: none;
  clip: auto;
  color: inherit;
  cursor: auto;
  direction: ltr;
  display: inline;
  float: none;
  font-size: 100%;
  font-stretch: normal;
  font-style: normal;
  font-variant: normal;
  font-weight: normal;
  height: auto;
  left: auto;
  letter-spacing: normal;
  line-height: inherit;
  margin: 0px;
  max-height: none;
  max-width: none;
  min-height: 0px;
  min-width: 0px;
  opacity: 1;
  outline-offset: 0px;
  overflow-wrap: normal;
  overflow: hidden;
  padding: 0px;
  perspective-origin: 50% 50%;
  perspective: none;
  pointer-events: auto;
  position: static;
  quotes: none;
  resize: none;
  right: auto;
  size: auto;
  table-layout: auto;
  text-align-last: initial;
  text-align: start;
  text-decoration: none;
  text-indent: 0px;
  text-shadow: none;
  text-transform: none;
  top: auto;
  transform-origin: 50% 50% 0px;
  transform: none;
  vertical-align: baseline;
  white-space: normal;
  word-break: normal;
  word-spacing: normal;
  font-family: 'Inter', sans-serif;
`

export const TinaReset = styled.div`
  ${TinaResetStyles}
  * {
    ${TinaResetStyles}
  }
`
