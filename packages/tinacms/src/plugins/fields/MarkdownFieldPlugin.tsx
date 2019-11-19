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

import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { Wysiwyg } from '@tinacms/fields'
import styled from 'styled-components'
import { useFrameContext } from '../../components/SyledFrame'
import * as React from 'react'
import { InputCss } from '@tinacms/fields'

const lightMediumGrey = `rgb(200, 200, 200)`
const darkGrey = 'rgb(40, 40, 40)'

const FramedWysiwyg = (props: any) => {
  const frame = useFrameContext()

  return <Wysiwyg {...props} frame={frame} />
}

export const MarkdownField = wrapFieldsWithMeta(styled(FramedWysiwyg)`
  position: relative;

  > [contenteditable] {
    ${InputCss}
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    min-height: 15rem;
    max-height: 25rem;
    overflow-y: auto;

    ::selection {
      background-color: rgba(0, 132, 255, 0.3);
    }

    div::selection {
      background: rgba(0, 0, 0, 0);
    }

    div[contenteditable] {
      display: inline-block;
    }

    > *:first-child {
      margin-top: 0;
    }

    > *:last-child {
      margin-bottom: 0;
    }
  }

  color: ${darkGrey};
  background-color: #fff;
  font-size: 16px;
  line-height: 26px;
  white-space: pre-wrap;
  -webkit-font-smoothing: antialiased;
  text-shadow: none;
  font-weight: 400;
  cursor: auto;
  overflow-wrap: break-word;
  word-wrap: break-word;

  p {
    font-size: 16px;
    line-height: 26px;
    font-weight: normal;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: 600;
    text-transform: none;
    padding: 0;
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 40px;
    line-height: 48px;
    margin-top: 0;
    &:not(:first-child) {
      margin-top: 32px;
    }
  }

  h2,
  h3,
  h4,
  h5,
  h6 {
    &:not(:first-child) {
      margin-top: 21px;
    }
  }

  h2 {
    font-size: 34px;
    line-height: 38px;
    margin-top: 0;
  }

  h3 {
    font-size: 26px;
    line-height: 30px;
    margin-top: 0;
  }

  h4 {
    font-size: 21px;
    line-height: 28px;
    margin-top: 0;
  }

  h5 {
    font-size: 18px;
    line-height: 24px;
    margin-top: 0;
  }

  h6 {
    font-size: 16px;
    line-height: 20px;
    margin-top: 0;
  }

  a {
    color: #0084ff;
    border: 0;
    font-weight: normal;
    text-decoration: underline;
  }

  small {
    font-size: 0.707em;
  }

  ul,
  ol {
    margin: 0;
    padding: 0;
  }

  ol li {
    /* prevent 2-digits numbers from being cut-off */
    margin-left: 5px;
    margin-right: 5px;
  }

  ul {
    margin-left: 1.5em;
    margin-bottom: 1rem;
    list-style-type: disc;
    list-style-position: outside;
    list-style-image: none;
  }

  ol {
    margin-left: 1.25em;
    margin-bottom: 1rem;
    list-style-type: decimal;
  }

  li {
    list-style: inherit;
    ol,
    ul {
      margin-bottom: 0;
    }
  }

  code {
    font-family: 'Roboto Mono', monospace;
    font-size: 14px;
    background: rgba(53, 50, 50, 0.08);
    padding: 0.1em 0.25em;
  }

  pre {
    padding: 0;
    margin: 0;
  }

  pre > code {
    display: block;
    padding: 0.15em 0.6em;
  }

  img {
    max-width: 100%;
    border: 0;
    padding: 0;
    margin-bottom: 1rem;
  }

  hr {
    display: block;
    height: 1px;
    width: 100%;
    border: 0;
    background: ${lightMediumGrey};
    margin: 1rem 0;
  }

  blockquote {
    margin: 0 0 1rem 0;
    border-left: 2px solid ${lightMediumGrey};
    padding-left: 15px;
  }

  mark {
    color: ${darkGrey};
    background-color: #ffe9a8;
    padding: 0.1em 0.25em;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    position: relative;
    &:before {
      font-size: 14px;
      text-align: left;
      font-weight: 500;
      color: ${lightMediumGrey};
      position: absolute;
      left: -35px;
      width: 30px;
      cursor: pointer;
      transition: color 0.25s ease;
    }
    &:hover:before {
      color: ${darkGrey};
    }
  }

  blockquote {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      &:before {
        display: none;
      }
    }
  }
`)

export default {
  name: 'markdown',
  Component: MarkdownField,
}
