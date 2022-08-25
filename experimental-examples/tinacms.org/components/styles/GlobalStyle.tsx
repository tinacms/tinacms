import { createGlobalStyle, css } from 'styled-components'
import React from 'react'

const CssReset = css`
  html,
  body,
  p,
  ol,
  ul,
  li,
  dl,
  dt,
  dd,
  blockquote,
  figure,
  fieldset,
  legend,
  textarea,
  pre,
  iframe,
  hr,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    padding: 0;
  }

  ul {
    list-style: none;
  }

  button,
  input,
  select,
  textarea {
    margin: 0;
  }

  html {
    box-sizing: border-box;
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  img,
  video {
    height: auto;
    max-width: 100%;
  }

  iframe {
    border: 0;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  td,
  th {
    padding: 0;
    text-align: left;
  }
`

// @ts-ignore
export const GlobalStyle = React.memo(createGlobalStyle`
  ${CssReset}

  html {
    font-size: 81.25%;
    font-weight: normal;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
      "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
      "Helvetica Neue", sans-serif;
    line-height: 1.6;
    width: 100%;
    overflow-x: hidden;
    height: 100%;
    min-height: 100%;
    box-sizing: border-box;
    -webkit-font-smooth: 'antialiased';
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;

    @media (min-width: 450px) {
      font-size: 87.5%;
    }

    @media (min-width: 685px) {
      font-size: 100%;
    }

    /* Color */
    --color-white: #FFFFFF;
    --color-orange-light: #EB6337;
    --color-orange: #EC4815;
    --color-orange-dark: #CE411D;
    --color-secondary: #31215E;
    --color-secondary-dark: #241748;
    --color-blue: var(--color-secondary-dark);
    --color-blue-light: var(--color-secondary);
    --color-tina-blue: #2296FE;
    --color-tina-blue-light: #00A5FF;
    --color-tina-blue-dark: #0574E4;
    --color-seafoam-100: #F2FDFC;
    --color-seafoam-200: #E6FAF8;
    --color-seafoam-300: #D1FAF6;
    --color-seafoam-400: #B4F4E0;
    --color-seaforam-500: #96E7D8;
    --color-seafoam: var(--color-seafoam-200);
    --color-seafoam-dark: var(--color-seafoam-400);
    --color-light: #FAFAFA;
    --color-light-dark: #E9E9EC;
    --color-warning-light: #FFFBEB;
    --color-warning: #FEF3C7;
    --color-warning-dark: #FDE68A;
    --color-tina-blue-light: #2296fe;
    --color-tina-blue: #0084ff;
    --color-tina-blue-dark: #0574e4;
    --color-error-light: var(--color-orange-light);
    --color-error: var(--color-orange);
    --color-error-dark: var(--color-orange-dark);
    --color-success-light: #57c355;
    --color-success: #3cad3a;
    --color-success-dark: #249a21;
    --color-grey: #595959;
    --color-grey-dark: #404040;
    --color-grey-0: #ffffff;
    --color-grey-1: #f6f6f9;
    --color-grey-2: #edecf3;
    --color-grey-3: #e1ddec;
    --color-grey-4: #b2adbe;
    --color-grey-5: #918c9e;
    --color-grey-6: #716c7f;
    --color-grey-7: #565165;
    --color-grey-8: #433e52;
    --color-grey-9: #363145;
    --color-grey-10: #252336;
    --color-indicator: var(--color-primary);

    --radius-small: 5px;
    --radius-big: 24px;

    --padding-small: 12px;
    --padding-big: 20px;

    --font-size-0: 12px;
    --font-size-1: 13px;
    --font-size-2: 15px;
    --font-size-3: 16px;
    --font-size-4: 18px;
    --font-size-5: 20px;
    --font-size-6: 22px;
    --font-size-7: 26px;
    --font-size-8: 32px;

    --font-family: 'Inter', sans-serif;

    --font-weight-regular: 400;
    --font-weight-bold: 600;

    --shadow-big: 0px 2px 3px rgba(0, 0, 0, 0.05),
      0 4px 12px rgba(0, 0, 0, 0.1);
    --shadow-small: 0px 2px 3px rgba(0, 0, 0, 0.12);

    --timing-short: 85ms;
    --timing-medium: 150ms;
    --timing-long: 250ms;

    --z-index-0: 0;
    --z-index-1: 10;
    --z-index-2: 20;
    --z-index-3: 30;
    --z-index-4: 40;
    --z-index-5: 50;

    /* Layout */
    --breakpoint-small: 400px;
    --breakpoint-medium: 800px;
    --breakpoint-large: 1200px;

    --spacer-size: 4.5rem;
    --section-padding: calc(var(--spacer-size) * 2);
    --container-padding: 2rem;

    /* Typography */
    --font-tuner: 'tuner-regular', -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
      "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
      "Helvetica Neue", sans-serif;

    * {
      box-sizing: inherit;
      font-variant-numeric: inherit;
      font-family: inherit;
      line-height: inherit;
      font-size: 100%;
      font-weight: inherit;
      scrollbar-width: thin;
      scrollbar-color: #E1DDEC var(--color-light);
      
      &::-webkit-scrollbar {
        width: 9px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
        border-left: 1px solid var(--color-light-dark);
        border-right: 1px solid var(--color-light-dark);
      }
      &::-webkit-scrollbar-thumb {
        background-color: #E1DDEC;
        border-radius: 0;
        border: none;
      }
    }
  }

  ::-moz-selection {
    background: var(--color-seafoam-dark);
    color: var(--color-blue-light);
  }
  ::selection {
    background: var(--color-seafoam-dark);
    color: var(--color-blue-light);
  }

  .fitVids-wrapper {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
  }
  .fitVids-wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`)
