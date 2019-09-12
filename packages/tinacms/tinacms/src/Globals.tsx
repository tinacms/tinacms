import * as React from 'react'
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components'

export const HEADER_HEIGHT = 4
export const FOOTER_HEIGHT = 4
export const SIDEBAR_WIDTH = '340px'
export const TOGGLE_WIDTH = '3.5rem'

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

export const RootElement = createGlobalStyle`
  @import url('https://rsms.me/inter/inter.css');
  html {
    font-family: 'Inter', sans-serif;
    font-size: 100%;
    -webkit-text-size-adjust: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }
  @supports (font-variation-settings: normal) {
    html { font-family: 'Inter var', sans-serif; }
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
