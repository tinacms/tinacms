import { expect, it } from 'vitest';
import { parseMDX } from '../../../parse';
import { serializeMDX } from '../../../stringify';
import * as util from '../util';
import { field } from './field';
import input from './in.md?raw';

it('matches input', () => {
  const tree = parseMDX(input, field, (v) => v);
  expect(util.print(tree)).toMatchFile(util.nodePath(__dirname));
  const string = serializeMDX(tree, field, (v) => v);
  expect(string).toMatchFile(util.mdPath(__dirname));
});
