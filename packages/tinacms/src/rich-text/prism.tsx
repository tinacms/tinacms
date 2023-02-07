/**

*/

import React from 'react'
import Highlight, { defaultProps } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/github'

export const Prism = (props: { value: string; lang?: string }) => {
  return (
    <Highlight
      {...defaultProps}
      theme={theme}
      code={props.value}
      // @ts-ignore prism will ignore syntax for languages it doesn't have
      language={props.lang}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={style}>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}
