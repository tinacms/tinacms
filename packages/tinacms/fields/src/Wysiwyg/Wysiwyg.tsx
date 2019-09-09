import * as React from 'react'
import { defaultBlockSchema } from './schema'
import { MarkdownTranslator, Translator } from './Translator'
import { EditorView } from 'prosemirror-view'
import { createEditorState } from './state'
import styled from 'styled-components'

let schema = defaultBlockSchema
let translator = MarkdownTranslator.fromSchema(schema, {})

let lightGrey = 'rgb(243, 243, 243)'
let lightMediumGrey = `darken(${lightGrey})`
let mediumGrey = `darken(${lightGrey}, 20);`
let darkGrey = 'rgb(40, 40, 40)'

export const Wysiwyg = styled(({ input, ...styleProps }: any) => {
  const prosemirrorEl = React.useRef<any>(null)

  React.useEffect(
    function setupEditor() {
      if (!prosemirrorEl.current) return

      let editorView = new EditorView(prosemirrorEl.current, {
        state: createEditorState(schema, translator, input.value),
        dispatchTransaction(tr) {
          const nextState: any = editorView.state.apply(tr as any)

          editorView.updateState(nextState as any)

          if (tr.docChanged) {
            input.onChange(translator!.stringFromNode(tr.doc))
          } else {
            // forceUpdate()
          }
        },
      })
      return () => editorView.destroy()
    },
    [prosemirrorEl.current]
  )

  return (
    <div>
      <div {...styleProps} ref={prosemirrorEl} />
    </div>
  )
})`
  position: relative;
  height: 100%;

  > [contenteditable] {
    outline: 0px solid transparent;
    border-bottom: 1px dashed ${mediumGrey};
    padding-top: 1rem;
    padding-bottom: 0.5em;
    min-height: 100px;

    overflow: auto;
    -webkit-overflow-scrolling: touch;

    &:focus {
      border-bottom: 1px solid rgb(33, 224, 158);
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
  font-family: Avenir, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
    font-family: Avenir, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
  }

  // Set margin top if h1 is used somewhere in the middle of the document
  * + h1 {
    margin-top: 32px;
  }

  h2 {
    font-size: 34px;
    line-height: 38px;
    margin-top: 21px;
  }

  h3 {
    font-size: 26px;
    line-height: 30px;
    margin-top: 21px;
  }

  h4 {
    font-size: 21px;
    line-height: 28px;
    margin-top: 21px;
  }

  h5 {
    font-size: 18px;
    line-height: 24px;
    margin-top: 21px;
  }

  h6 {
    font-size: 16px;
    line-height: 20px;
    margin-top: 21px;
  }

  // Links
  a {
    color: $rgb(33, 224, 158);
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
    background: ${lightGrey};
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

  h1:before {
    content: 'h1';
    top: 7px;
  }

  h2:before {
    content: 'h2';
    top: 6px;
  }

  h3:before {
    content: 'h3';
    top: 3px;
  }

  h4:before {
    content: 'h4';
    top: 2px;
  }

  h5:before {
    content: 'h5';
    top: 1px;
  }

  h6:before {
    content: 'h6';
    top: 1px;
  }
`
