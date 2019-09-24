import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { Wysiwyg } from '@tinacms/fields'
import styled from 'styled-components'
import { useFrameContext } from '../../components/SyledFrame'
import * as React from 'react'
import { color } from '@tinacms/styles'

// let lightGrey = 'rgb(243, 243, 243)'
let lightMediumGrey = `rgb(200, 200, 200)`
// let mediumGrey = `rgb(143, 143, 143);`
let darkGrey = 'rgb(40, 40, 40)'

const FramedWysiwyg = (props: any) => {
  let frame = useFrameContext()

  return <Wysiwyg {...props} frame={frame} />
}

export const MarkdownField = wrapFieldsWithMeta(styled(FramedWysiwyg)`
  position: relative;
  height: 100%;

  > [contenteditable] {
    background-color: ${p => p.theme.color.light};
    border-color: ${p => (p.error ? 'red' : '#F2F2F2')};
    border-radius: ${p => p.theme.input.radius};
    font-size: ${p => p.theme.input.fontSize};
    line-height: ${p => p.theme.input.lineHeight};
    transition: background-color ${p => p.theme.timing.short} ease-out,
      border-color ${p => p.theme.timing.short} ease-out,
      box-shadow ${p => p.theme.timing.medium} ease-out;
    padding: ${p => p.theme.input.padding};
    border-width: 1px;
    border-style: solid;
    width: 100%;
    margin: 0;
    outline: none;

    overflow: auto;
    -webkit-overflow-scrolling: touch;

    ::selection {
      background-color: rgba(0, 132, 255, 0.3);
    }

    &:hover {
      background-color: #f0f0f0;
    }

    &:focus {
      border-color: ${color('primary')};
      box-shadow: 0 0 2px 0 ${color('primary')};
      background-color: #f8f8f8;
    }

    div::selection {
      background: rgba(0, 0, 0, 0);
    }

    div[contenteditable] {
      display: inline-block;
    }
  }

  // Base styling
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

  // Base heading
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

  // Heading: h1
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

  // Links
  a {
    color: #0084ff;
    border: 0;
    font-weight: normal;
    text-decoration: underline;
  }

  // Small text
  small {
    font-size: 0.707em;
  }

  // List elements
  ul,
  ol {
    margin: 0;
    padding: 0;
  }

  ol li {
    // prevent 2-digits numbers from being cut-off
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

  // Code
  code {
    font-family: 'Roboto Mono', monospace;
    font-size: 14px;
    background: rgba(53, 50, 50, 0.08);
    padding: 0.1em 0.25em;
  }

  // Code blocks
  pre {
    padding: 0;
    margin: 0;
  }

  pre > code {
    display: block;
    padding: 0.15em 0.6em;
  }

  // Images
  img {
    max-width: 100%;
    border: 0;
    padding: 0;
    margin-bottom: 1rem;
  }

  // HR
  hr {
    display: block;
    height: 1px;
    width: 100%;
    border: 0;
    background: ${lightMediumGrey};
    margin: 1rem 0;
  }

  // Block quotes
  blockquote {
    margin: 0 0 1rem 0;
    border-left: 2px solid ${lightMediumGrey};
    padding-left: 15px;
  }

  // Highlighting (Not supported in editor yet)
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

  // Disable margin tag for headings inside blockquotes
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
