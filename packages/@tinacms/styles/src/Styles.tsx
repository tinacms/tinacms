// @ts-nocheck
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

import styled, { createGlobalStyle, css } from 'styled-components'
import * as React from 'react'
import { FontLoader } from './FontLoader'

export function Theme() {
  return (
    <>
      <FontLoader />
      <GlobalStyles />
    </>
  )
}

const theme = css`
  :root {
    --tina-color-primary-light: #2296fe;
    --tina-color-primary: #2296fe;
    --tina-color-primary-dark: #0574e4;
    --tina-color-error-light: #eb6337;
    --tina-color-error: #ec4815;
    --tina-color-error-dark: #dc4419;
    --tina-color-warning-light: #f5e06e;
    --tina-color-warning: #e9d050;
    --tina-color-warning-dark: #d3ba38;
    --tina-color-success-light: #57c355;
    --tina-color-success: #3cad3a;
    --tina-color-success-dark: #249a21;
    --tina-color-grey-0: #ffffff;
    --tina-color-grey-1: #f6f6f9;
    --tina-color-grey-2: #edecf3;
    --tina-color-grey-3: #e1ddec;
    --tina-color-grey-4: #b2adbe;
    --tina-color-grey-5: #918c9e;
    --tina-color-grey-6: #716c7f;
    --tina-color-grey-7: #565165;
    --tina-color-grey-8: #433e52;
    --tina-color-grey-9: #363145;
    --tina-color-grey-10: #252336;

    --tina-radius-small: 5px;
    --tina-radius-big: 24px;

    --tina-padding-small: 12px;
    --tina-padding-big: 20px;

    --tina-font-size-0: 12px;
    --tina-font-size-1: 13px;
    --tina-font-size-2: 15px;
    --tina-font-size-3: 16px;
    --tina-font-size-4: 18px;
    --tina-font-size-5: 20px;
    --tina-font-size-6: 22px;
    --tina-font-size-7: 26px;
    --tina-font-size-8: 32px;

    --tina-font-family: 'Inter', sans-serif;

    --tina-font-weight-regular: 400;
    --tina-font-weight-bold: 600;

    --tina-shadow-big: 0px 2px 3px rgba(0, 0, 0, 0.05),
      0 4px 12px rgba(0, 0, 0, 0.1);
    --tina-shadow-small: 0px 2px 3px rgba(0, 0, 0, 0.12);

    --tina-timing-short: 85ms;
    --tina-timing-medium: 150ms;
    --tina-timing-long: 250ms;

    --tina-z-index-0: 500;
    --tina-z-index-1: 1000;
    --tina-z-index-2: 1500;
    --tina-z-index-3: 2000;
    --tina-z-index-4: 2500;
    --tina-z-index-5: 3000;

    --tina-sidebar-width: 340px;
    --tina-sidebar-header-height: 60px;
    --tina-toolbar-height: 62px;
  }
`

export const GlobalStyles = createGlobalStyle`
  ${theme};
`

export const tina_reset_styles = css`
  * {
    font-family: 'Inter', sans-serif;
    &::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
      border-left: 1px solid var(--tina-color-grey-2);
    }
    &::-webkit-scrollbar-thumb {
      background-color: var(--tina-color-grey-3);
      border-radius: 0;
      border: none;
    }
  }

  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  hr {
    border-color: var(--tina-color-grey-2);
    color: var(--tina-color-grey-2);
    margin-bottom: var(--tina-padding-big);
    margin-left: calc(var(--tina-padding-big) * -1);
    margin-right: calc(var(--tina-padding-big) * -1);
    border-top: 1px solid var(--tina-color-grey-2);
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
    :not([class]) {
      font-family: 'Inter', sans-serif;
      &:first-child {
        margin-top: 0;
      }
      &:last-child {
        margin-bottom: 0;
      }
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
    :not([class]) {
      font-weight: var(--tina-font-weight-bold);
    }
  }
  h1:not([class]) {
    font-size: var(--tina-font-size-8);
  }
  h2:not([class]) {
    font-size: var(--tina-font-size-7);
  }
  h3:not([class]) {
    font-size: var(--tina-font-size-5);
  }
  h4:not([class]) {
    font-size: var(--tina-font-size-4);
  }
  h5:not([class]) {
    font-size: var(--tina-font-size-3);
  }
  h6:not([class]) {
    font-size: var(--tina-font-size-2);
  }
`

export const StyleReset = styled.div`
  ${tina_reset_styles}
`

/**
 * @alias StyleReset
 * @deprecated
 */
export const TinaReset = StyleReset
