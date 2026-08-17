import { expect, it } from 'vitest';
import * as util from '../../../next/tests/util';
import { serializeMDX } from '../../../stringify';
import { parseMDX } from '../../index';
import { field } from './field';
import input from './in.md?raw';

it('matches input', () => {
  const tree = parseMDX(input, field, (v) => v);
  const string = serializeMDX(tree, field, (v) => v);
  expect(util.print(tree)).toMatchFile(util.nodePath(__dirname));
  expect(string).toMatchFile(util.mdPath(__dirname));
});
