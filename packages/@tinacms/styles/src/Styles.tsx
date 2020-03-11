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

const theme = css`
  :root {
    --color-primary-light: #2296fe;
    --color-primary: #2296fe;
    --color-primary-dark: #0574e4;
    --color-error-light: #eb6337;
    --color-error: #ec4815;
    --color-error-dark: #dc4419;
    --color-warning-light: #f5e06e;
    --color-warning: #e9d050;
    --color-warning-dark: #d3ba38;
    --color-success-light: #57c355;
    --color-success: #3cad3a;
    --color-success-dark: #249a21;
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
    --color-grey-10: #282828;

    --radius-small: 5px;
    --radius-big: 24px;

    --padding-small: 12px;
    --padding-big: 20px;

    --font-size-0: 11px;
    --font-size-1: 13px;
    --font-size-2: 15px;
    --font-size-3: 16px;
    --font-size-4: 18px;
    --font-size-5: 20px;
    --font-size-6: 22px;
    --font-size-7: 26px;
    --font-size-8: 32px;

    --font-family: 'Inter', sans-serif;

    --font-weight-regular: 500;
    --font-weight-bold: 600;

    --shadow-big: 0px 2px 3px rgba(0, 0, 0, 0.12),
      0px 4px 8px rgba(48, 48, 48, 0.1);
    --shadow-small: 0px 2px 3px rgba(0, 0, 0, 0.12);

    --timing-short: 85ms;
    --timing-medium: 150ms;
    --timing-long: 250ms;
  }
`

export const GlobalStyles = createGlobalStyle`
  ${theme};
  @import url('https://rsms.me/inter/inter.css');
`

export const TinaResetStyles = css`
  all: unset;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;

  *:not(svg|*) {
    all: unset;
    font-family: 'Inter', sans-serif;
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  hr {
    border-color: var(--color-grey-2);
    color: var(--color-grey-2);
    margin-bottom: var(--padding-big);
    margin-left: calc(var(--padding-big) * -1);
    margin-right: calc(var(--padding-big) * -1);
    border-top: 1px solid var(--color-grey-2);
    border-bottom: none;
    height: 0;
    box-sizing: content-box;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
  td,
  th {
    padding: 0;
    width: auto;
    height: auto;
    border: inherit;
    margin: 0;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: var(--font-weight-bold);
  }
  h1 {
    font-size: var(--font-size-8);
  }
  h2 {
    font-size: var(--font-size-7);
  }
  h3 {
    font-size: var(--font-size-5);
  }
  h4 {
    font-size: var(--font-size-4);
  }
  h5 {
    font-size: var(--font-size-3);
  }
  h6 {
    font-size: var(--font-size-2);
  }
`

export const TinaReset = styled.div`
  ${TinaResetStyles}
`
