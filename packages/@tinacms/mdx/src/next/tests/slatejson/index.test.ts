import { expect, it } from 'vitest';
import { parseMDX } from '../../../parse';
import type * as Plate from '../../../parse/plate';
import { formatMdxForPersistence } from '../../../stringify';
import * as util from '../util';
import { field } from './field';
import input from './node.json?raw';

it('matches input', () => {
  const tree = parseMDX(input, field, (v) => v);
  expect(tree).toBeTypeOf('object');
  //   expect(util.print(tree)).toMatchFile(input);

  const rootElement = formatMdxForPersistence(tree, field, (v) => v);
  expect(rootElement).toBeTypeOf('object');
  expect(util.print(rootElement as Plate.RootElement)).toMatchFile(
    util.nodePath(__dirname)
  );
});
