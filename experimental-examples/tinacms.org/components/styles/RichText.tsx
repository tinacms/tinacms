import { css } from 'styled-components'

/* Styles rich text (markdown output).
   Use the RichTextWrapper component to easily apply these styles,
   or add the css via ${RichText} to a component
*/

const RichText = css`
  /* Spacing */

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 2rem 0 1.5rem 0;
    &:first-child {
      margin-top: 0;
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
  .h1 {
    font-size: 2.5rem;
    line-height: 1.3;
    letter-spacing: 0.1px;
    color: var(--color-orange);

    em {
      color: var(--color-secondary-dark);
    }

    @media (min-width: 800px) {
      font-size: 3rem;
    }

    @media (min-width: 1200px) {
      font-size: 4rem;
    }
  }

  h2,
  .h2 {
    font-size: 2.25rem;
    line-height: 1.3;
    letter-spacing: 0.1px;
    color: var(--color-orange);
    font-weight: bold;

    em {
      color: var(--color-secondary-dark);
    }
  }

  h3,
  .h3 {
    font-size: 1.5rem;
    font-weight: bold;
    line-height: 1.3;
    letter-spacing: 0.1px;
    color: var(--color-secondary-dark);

    em {
      color: var(--color-orange);
    }
  }

  h4,
  .h4 {
    font-size: 1.25rem;
    font-weight: bold;
    line-height: 1.3;
    letter-spacing: 0.1px;
    color: var(--color-secondary-dark);

    em {
      color: var(--color-orange);
    }
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
    display: block;
    margin: 1.5rem auto;
    border-radius: 5px;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(237, 238, 238);
    border-image: initial;
    overflow: hidden;
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
    border-radius: 5px;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(237, 238, 238);
    border-image: initial;
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
`

export default RichText
