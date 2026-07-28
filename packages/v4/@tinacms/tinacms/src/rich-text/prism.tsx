/**

*/

import { Highlight, themes } from 'prism-react-renderer';
import React from 'react';

export const Prism = (props: {
  value: string;
  lang?: string;
  theme?: keyof typeof themes;
}) => {
  return (
    <Highlight
      theme={themes[props.theme || 'github']}
      code={props.value || ''}
      language={props.lang || ''}
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
  );
};
