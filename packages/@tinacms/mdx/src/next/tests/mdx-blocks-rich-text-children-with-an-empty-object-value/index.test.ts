import { expect, it } from 'vitest';
import { RootElement } from '../../../parse/plate';
import { serializeMDX } from '../../../stringify';
import * as util from '../util';
import { field } from './field';

it('matches input', () => {
  const tree: RootElement = {
    type: 'root',
    children: [
      {
        type: 'mdxJsxFlowElement',
        name: 'Cta',
        children: [
          {
            type: 'text',
            text: '',
          },
        ],
        props: {
          children: {},
        },
      },
    ],
  };

  const string = serializeMDX(tree, field, (v) => v);
  expect(string).toMatchFile(util.mdPath(__dirname));
});
