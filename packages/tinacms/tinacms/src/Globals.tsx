import * as React from 'react'
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components'

export const HEADER_HEIGHT = 4
export const FOOTER_HEIGHT = 4
export const SIDEBAR_WIDTH = '340px'
export const TOGGLE_WIDTH = '56px'
export const Z_INDEX = 2147000000

export const Theme = {
  color: {
    primary: '#0084ff',
    light: '#F4F4F4',
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
  },
  input: {
    padding: '0.75rem',
    radius: '0.25rem',
    fontSize: '0.9rem',
    lineHeight: 1.35,
  },
  padding: 1.25,
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
    border-color: #F2F2F2;
    color: #F2F2F2;
    margin-bottom: 1.5rem;
    margin-left: -1.25rem;
    margin-right: -1.25rem;
    border-top: 1px solid #F2F2F2;
    border-bottom: none;
    height: 0;
    box-sizing: content-box;
  }
`

export const TinaReset = styled.div`
  * {
    font-family: 'Inter', sans-serif;
    font-size: 100%;
    -webkit-text-size-adjust: 100%;
    box-sizing: border-box;
    overflow: hidden;
    font-style: normal;
    letter-spacing: normal;
    font-stretch: normal;
    font-weight: normal;
    text-align-last: initial;
    text-indent: 0px;
    text-shadow: none;
    text-transform: none;
    backface-visibility: visible;
    background-color: transparent;
    background-image: none;
    bottom: auto;
    box-shadow: none;
    box-sizing: content-box;
    caption-side: top;
    clear: none;
    clip: auto;
    color: inherit;
    cursor: auto;
    direction: ltr;
    display: inline;
    float: none;
    height: auto;
    left: auto;
    line-height: inherit;
    max-height: none;
    max-width: none;
    min-height: 0px;
    min-width: 0px;
    opacity: 1;
    outline-offset: 0px;
    perspective: none;
    perspective-origin: 50% 50%;
    pointer-events: auto;
    position: static;
    quotes: none;
    resize: none;
    right: auto;
    size: auto;
    table-layout: auto;
    top: auto;
    transform: none;
    transform-origin: 50% 50% 0px;
    vertical-align: baseline;
    white-space: normal;
    word-break: normal;
    word-spacing: normal;
    overflow-wrap: normal;
    text-align: start;
    -webkit-font-smoothing: antialiased;
    font-variant: normal;
    text-decoration: none;
    border-width: 0px;
    border-style: none;
    border-color: transparent;
    border-image: initial;
    border-radius: 0px;
    margin: 0px;
    padding: 0px;
  }
`
