import { css } from 'styled-components'

/* Styles rich text (markdown output).
   Use the RichTextWrapper component to easily apply these styles,
   or add the css via ${RichText} to a component
*/

const DocsRichText = css`
  /* Spacing */

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    padding-top: 1rem;
    margin: 1rem 0 1.5rem 0;
    &:first-child {
      margin-top: 0;
      padding-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }

  p,
  iframe,
  blockquote,
  image {
    margin: 1.5rem 0;
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }

  ul,
  ol {
    padding-left: 2rem;
    margin-bottom: 1.5rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  /* Styling */

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    position: relative;
    font-family: var(--font-tuner);
    font-weight: regular;
    font-style: normal;
    em {
      font-style: normal;
    }
  }

  h1,
  .h1,
  h2,
  .h2,
  h3,
  .h3,
  h4,
  .h4 {
    line-height: 1.3;
    letter-spacing: 0.1px;
    color: var(--color-secondary-dark);
  }

  h1,
  .h1,
  h2,
  .h2 {
    font-weight: bold;
    color: var(--color-orange);
    em {
      color: var(--color-orange);
      font-style: italic;
    }
  }

  h3,
  .h3,
  h4,
  .h4 {
    color: var(--color-secondary);
    em {
      color: var(--color-secondary);
      font-style: italic;
    }
  }

  h1,
  .h1 {
    font-size: 2rem;
    @media (min-width: 1200px) {
      font-size: 2.5rem;
    }
  }

  h2,
  .h2 {
    font-size: 1.5rem;
    @media (min-width: 1200px) {
      font-size: 1.625rem;
    }
  }

  h3,
  .h3 {
    font-size: 1.3125rem;
  }

  h4,
  .h4 {
    font-size: 1.125rem;
  }

  p {
    font-size: 16px;
    color: var(--color-secondary-dark);

    @media (min-width: 685px) {
      font-size: 18px;
    }

    img {
      display: block;
      margin: 1.5rem auto;
      border-radius: 5px;
      border-width: 1px;
      border-style: solid;
      border-color: rgb(237, 238, 238);
      border-image: initial;
      overflow: hidden;
    }
  }

  iframe {
    max-width: 100%;
    display: block;
    margin: 1.5rem auto;
    border-radius: 5px;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(237, 238, 238);
    border-image: initial;
    overflow: hidden;
  }

  iframe.wide {
    position: relative;
    min-width: 66vw;
    max-width: 1400px;
    left: 50%;
    transform: translate3d(-50%, 0, 0);
  }

  a:not([class]) {
    color: inherit;
    opacity: 0.8;
    text-decoration: underline rgba(0, 0, 0, 0.3);
    transition: all 185ms ease-out;

    &:hover,
    &:focus {
      opacity: 1;
      color: var(--color-orange);
      text-decoration-color: var(--color-orange);
    }
  }

  blockquote {
    display: block;
    font-size: 1.125rem;
    background-color: var(--color-seafoam);
    border: 1px solid var(--color-seafoam-dark);
    border-left-width: 6px;
    border-radius: 3px;
    padding: 1em;
  }

  li blockquote {
    display: block;
    border: none;
    border-radius: 0;
    background: none;
    padding: 0 0 0 1rem;
    border-left: 1px solid var(--color-seafoam-dark);
    margin: -1rem 0 1.5rem 0 !important;

    a {
      font-size: 1rem;
    }
  }

  hr {
    border-top: none;
    border-right: none;
    border-left: none;
    border-image: initial;
    border-bottom: 5px dotted var(--color-seafoam-dark);
    width: 6rem;
    max-width: 100%;
    display: block;
    height: 0px;
    margin: 2rem 0px;
  }

  strong {
    font-weight: bold;
  }

  ul {
    list-style-type: disc;
  }

  li {
    font-size: 1.125rem;
    color: var(--color-secondary-dark);
  }

  *:not(pre) > code {
    padding: 0.1em 0.2em;
    border-radius: 0.3em;
    background-color: var(--color-light);
    border: 1px solid var(--color-light-dark);
    border-radius: 0.3rem;
    color: var(--color-orange);
    font-size: 1em;
    line-height: inherit;
  }

  pre {
    background-color: var(--color-light);
    border: 1px solid var(--color-light-dark);
    text-shadow: white 0px 1px;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    text-align: left;
    word-spacing: normal;
    word-break: normal;
    overflow-wrap: normal;
    line-height: 1.5;
    tab-size: 4;
    hyphens: none;
    padding: 1em;
    margin: 0.5em 0px;
    overflow: auto;
    border-radius: 0.3rem;
    /* fix wrapping issues breaking layout */
    white-space: pre-wrap !important;
    white-space: -moz-pre-wrap !important;
    white-space: -pre-wrap !important;
    white-space: -o-pre-wrap !important;
    word-wrap: break-word !important;
    code {
      white-space: pre-wrap !important;
      white-space: -moz-pre-wrap !important;
      white-space: -pre-wrap !important;
      white-space: -o-pre-wrap !important;
      word-wrap: break-word !important;
    }
  }

  table {
    width: 100%;
    line-height: 1.375;
  }

  tr {
    &:nth-child(even) {
      background-color: var(--color-light);
    }
  }

  th,
  td {
    padding: 0.4rem 0.5rem;
  }

  th {
    border-bottom: 3px solid var(--color-light-dark);
    font-family: var(--font-tuner);
    font-weight: regular;
    font-style: normal;
    color: var(--color-orange);
    letter-spacing: 0.5px;
    font-size: 1.125rem;
    line-height: 1.3;
    letter-spacing: 0.1px;
  }

  td {
    border-bottom: 1px solid var(--color-light-dark);
  }

  .callout {
    margin: 2rem 0;
    padding: 1.5rem 2rem;
    background-image: url(/img/clouds.jpg);
    background-position: center top;
    background-repeat: no-repeat;
    background-size: cover;
    display: grid;
    grid-gap: 2rem;
    align-content: center;
    align-items: center;
    border-radius: 0.3rem;
    border: 1px solid var(--color-seafoam);
    overflow: hidden;

    @media (min-width: 1000px) {
      grid-gap: 2.5rem;
      grid-template-columns: 1fr 2fr;
    }

    div {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    h3 {
      color: var(--color-orange);
      font-size: 1.5rem;
      margin-bottom: 1.25rem;
    }

    p {
      font-size: 1rem;
      margin: 0 0 1.375rem 0;
    }

    img {
      position: relative;
      max-width: 14rem;
      margin: -1rem 0;

      @media (min-width: 1000px) {
        margin: -1rem 0 -3rem 0;
      }
    }
  }

  .calloutButton {
    flex: 0 0 auto;
    position: relative;
    text-decoration: none;
    color: inherit;
    font-size: 1.125rem;
    line-height: 1;
    font-weight: bold;
    padding: 0.75rem 1.625rem;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    white-space: nowrap;
    outline: none;
    background: var(--color-orange);
    transition: background 150ms ease-out;
    color: white;

    :hover,
    ::focus,
    :active {
      background: var(--color-orange-light);
    }

    svg {
      display: inline-block;
      width: auto;
      height: 1.125em;
      margin-left: 0.75rem;
    }
  }
`

export default DocsRichText
