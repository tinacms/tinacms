import * as React from 'react'
import styled, {
  ThemeProvider,
  createGlobalStyle,
  css,
} from 'styled-components'
import { defaultProps } from 'react-select/lib/Async'

export interface ThemeProps {
  theme: Theme
}

export function borderRadius(size: keyof Theme['radius'] = 'big') {
  return (props: ThemeProps) => props.theme.radius[size]
}

export function padding(size: keyof Theme['padding'] = 'big') {
  return (props: ThemeProps) => props.theme.padding[size]
}

export function color(name: keyof Theme['color']) {
  return (props: ThemeProps) => props.theme.color[name]
}

export interface Theme {
  color: {
    primary: string
    light: string
    medium: string
    dark: string
  }
  radius: {
    small: string
    big: string
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
  input: {
    padding: string
    radius: string
    fontSize: string
    lineHeight: number
  }
  padding: {
    small: number
    big: number
  }
}

export const theme: Theme = {
  color: {
    primary: '#0084ff',
    light: '#F2F2F2',
    medium: '#B4B4B4',
    dark: '#353232',
  },
  radius: {
    small: '0.25rem',
    big: '0.5rem',
  },
  shadow: {
    small: '0px 2px 3px rgba(48, 48, 48, 0.15)',
    big:
      '0px 2px 3px rgba(48, 48, 48, 0.15), 0px 4px 8px rgba(48, 48, 48, 0.1);',
  },
  timing: {
    short: '85ms',
    medium: '150ms',
    long: '250ms',
  },
  input: {
    padding: '0.75rem',
    radius: '0.25rem',
    fontSize: '0.9rem',
    lineHeight: 1.35,
  },
  padding: {
    small: 0.75,
    big: 1.25,
  },
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
    border-color: ${color('light')};
    color: ${color('light')};
    margin-bottom: 1.5rem;
    margin-left: -1.25rem;
    margin-right: -1.25rem;
    border-top: 1px solid ${color('light')};
    border-bottom: none;
    height: 0;
    box-sizing: content-box;
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
